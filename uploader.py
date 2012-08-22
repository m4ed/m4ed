import sys
import zmq
import pymongo
import os
import threading

from bson import ObjectId

from m4ed.util.settings import parse_asset_settings
from m4ed.util.image import ImageProcessor

try:
    import configparser
except ImportError:  # pragma: no cover
    import ConfigParser as configparser


def main():
    settings = configparser.SafeConfigParser()
    with open(sys.argv[1]) as fp:
        settings.readfp(fp)
    settings = dict(settings.items('app:main'))
    settings.update(parse_asset_settings(settings))

    url_worker = 'inproc://workers'
    url_client = settings['zmq.socket']

    context = zmq.Context(1)

    # The 'frontend' facing the clients where new jobs are being sent
    clients = context.socket(zmq.PULL)
    clients.bind(url_client)

    # The 'backend' facing the workers where received jobs are being pushed
    workers = context.socket(zmq.PUSH)
    workers.bind(url_worker)

    conn = pymongo.Connection(
        host=settings['db.mongo.host'],
        port=int(settings['db.mongo.port'])
        )

    db = conn[settings['db.mongo.collection_name']]

    cloud = None
    if not settings['store_locally']:
        print '\n\nInitializing cloud connection...'
        cloud = settings['service'](**settings)
        cloud.connect()

    save_path = settings['save_path']

    for i in range(int(settings['zmq.workers'])):
        worker = UploadWorker(
            name='[worker-thread-{}]'.format(i),
            imager=ImageProcessor(
                db=db,
                image_save_path=settings['save_path']
                ),
            context=context,
            worker_url=url_worker,
            db=db,
            cloud=cloud,
            save_path=save_path
            )
        worker.start()

    try:
        print 'Starting zmq streamer'
        print 'Now waiting for jobs...'
        zmq.device(zmq.STREAMER, clients, workers)
    except KeyboardInterrupt:
        pass

    # We never get here... but if we do, shut down!
    print '\n\nShutting down...\n'

    clients.close()
    workers.close()
    context.term()


class UploadWorker(threading.Thread):
    def __init__(self, name, imager, context, worker_url, db, save_path, cloud=None):
        super(UploadWorker, self).__init__()
        self.name = name
        self.imager = imager
        self.db = db
        self.cloud = cloud

        self.socket = context.socket(zmq.PULL)
        # Setting linger to 0 kills the socket right away when
        # it's closed and context is terminated
        self.socket.setsockopt(zmq.LINGER, 0)
        self.socket.connect(worker_url)

        self.save_path = save_path

        self._print('Spawned!')

    def _print(self, msg):
        print '{} - {}'.format(self.name, msg)

    def run(self):
        while True:
            try:
                s = self.socket.recv_string()
            except zmq.ZMQError:
                self.socket.close()
                break

            self._print('Handling the job...')
            self._print(s)

            args = s.split(':')
            getattr(self, args[0])(args[1])

    def save(self, file_path, **kw):
        resource_uri = kw.pop('resource_uri', '/static/tmp')
        try:
            r = self.imager.process(file_path)
        except [IOError, TypeError]:
            # When the image format isn't supported by pil an IOError is raised
            # TypeError is raised when the image doesn't match our whitelist
            # return {'result': 'error', 'why': 'image format not supported'}
            return
        finally:
            os.unlink(file_path)

        # TODO: Might be unnecessary?
        if len(r) == 0:
            return
            #return {'result': 'error', 'why': 'filetype not allowed'}

        data = dict(
            id=r.get('id'),
            size=r.get('size'),
            name=r.get('name'),
            delete_url='/api/assets/{}'.format(r.get('id')),
            delete_type='DELETE',
            type=r.get('type'),
            format=r.get('format'),
            desc='This is an image',
            status='local'
            )

        frames = r.get('frames')
        if frames:
            data['frames'] = frames

        if self.cloud:
            _id = self.db.assets.insert(data, safe=True)
            self._cloud_save(str(_id))
        else:
            dir_name = r.get('name').rsplit('.', 1)[0]
            #api_url = '/api/assets/{}'.format(r.get('id'))
            #if resource_uri != '':
            resource_uri = self.save_path
            print 'Saving the image to ' + resource_uri
            data['url'] = (resource_uri +
                '/{directory}/{full}').format(
                    directory=dir_name,
                    full=r.get('full')
                )

            data['thumbnail_url'] = (resource_uri +
                '/{directory}/{thumb}').format(
                    directory=dir_name,
                    thumb=r.get('thumb')
                )
            self.db.assets.insert(data, safe=True)

    def _cloud_save(self, _id):
        asset = self.db.assets.find_and_modify(
            query={'_id': ObjectId(_id), 'status': 'local'},
            update={'$set': {'status': 'processing'}}
            )

        # If there is no asset returned, assume it has been deleted
        # before it entered the save queue
        if not asset:
            return

        self._print(asset)
        name = asset.get('name')
        directory = asset.get('id')
        _type = asset.get('type')
        format = asset.get('format')
        thumb_name = '_s.'.join(name.rsplit('.', 1))
        full_save_path = os.path.join(
            self.save_path, directory, name
            )
        thumb_save_path = os.path.join(
            self.save_path, directory, thumb_name
            )

        url = self.cloud.save(
            path=full_save_path,
            _type=_type,
            format=format
            )
        os.unlink(full_save_path)
        thumb_url = self.cloud.save(
            path=thumb_save_path,
            _type=_type,
            format=format
            )
        os.unlink(thumb_save_path)

        if _type == 'anim':
            filename, file_extension = name.rsplit('.', 1)
            for i in range(1, asset.get('frames')):
                p = os.path.join(
                    self.save_path, directory, '{filename}_{index}.{extension}'.format(
                        index=i, filename=filename, extension=file_extension)
                    )
                self.cloud.save(
                    path=p,
                    _type=_type,
                    format=format
                    )
                os.unlink(p)

        os.rmdir(os.path.join(self.save_path, directory))

        result = self.db.assets.find_and_modify(
            query={'_id': ObjectId(_id)},
            update={'$set': {
                'url': url,
                'thumbnail_url': thumb_url,
                'status': 'cloud'
                }},
            safe=True
            )

        # If for some strange reason the object is not returned from mongo
        # assume it has been deleted by someone while it was uploading.
        # 'Revert' the changes by deleting the files from cloud.
        if not result:
            self._cloud_delete(name)

    def delete(self, _id):
        asset = self.db.assets.find_and_modify(
            query={'_id': ObjectId(_id)},
            remove=True,
            safe=True
            )
        self._print('Proceeding to delete ' + str(asset))
        if asset and asset.get('status') == 'cloud':
            anim_frames = asset.get('frames')
            self._cloud_delete(asset.get('name'), anim_frames)

    def _cloud_delete(self, name, anim_frames=0):
        self.cloud.delete(name)
        # A hack to derive the thumb name from full name
        filename, file_extension = name.rsplit('.', 1)
        thumb_name = '{filename}_s.{file_extension}'.format(
            filename=filename, file_extension=file_extension)
        self.cloud.delete(thumb_name)

        for i in range(1, anim_frames):
            self.cloud.delete(
                '{filename}_{index}.{extension}'.format(
                    filename=filename, index=i, extension=file_extension
                    )
                )


if __name__ == '__main__':
    main()
