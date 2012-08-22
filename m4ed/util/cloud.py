import cloudfiles

import os


class Cloud(object):
    def __init__(self, service, username, api_key, **settings):
        self.username = username
        self.api_key = api_key
        self.ssl = settings.pop('ssl', False)
        self.container_name = settings.pop('container_name')
        self.connpool = None


class CloudFiles(Cloud):
    def connect(self, servicenet=False):
        username = self.username
        api_key = self.api_key

        self.connpool = cloudfiles.ConnectionPool(
            username, api_key, servicenet=servicenet)
        #self.container = self._get_container(self.container_name)
        # Around 50 years
        #self.container.make_public(ttl=60 * 60 * 24 * 365 * 50)

    def _get_connection(self):
        return self.connpool.get()

    def _release_connection(self, connobj):
        self.connpool.put(connobj)

    def _get_container(self, container_name):
        conn = self._get_connection()
        try:
            container = conn.get_container(container_name)
        except cloudfiles.errors.NoSuchContainer:
            container = conn.create_container(
                container_name, error_on_existing=False
                )
        self._release_connection(conn)
        return container

    def save(self, path, _type, format):
        container = self._get_container(self.container_name)
        name = os.path.basename(path)
        obj = container.create_object(name)

        # Anim is actually just an image...
        if _type == 'anim':
            _type = 'image'
        obj.content_type = _type + '/' + format.lower()
        print obj.content_type
        with open(path, 'rb') as f:
            obj.write(f)
        if not self.ssl:
            return obj.public_uri()
        else:
            return obj.public_ssl_uri()

    def delete(self, *args, **kwargs):
        container = self._get_container(self.container_name)
        try:
            container.delete_object(*args, **kwargs)
        except cloudfiles.errors.ResponseError:
            pass
