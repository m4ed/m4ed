from PIL import Image, ImageOps
import os

from .base62 import Base62

WHITELIST = ['GIF', 'PNG', 'JPEG', 'BMP']


class ImageProcessor(object):
    def __init__(self, db, image_save_path):
        self.db = db
        self.image_save_path = image_save_path

    def get_save_path(self):
        return self.image_save_path

    def process(self, infile):
        im = Image.open(infile)
        print 'Image format was ', im.format
        if im.format not in WHITELIST:
            raise TypeError('image format not supported')

        cntr = self.db.counters.find_and_modify(
            query={'_id': 'imgId'},
            update={'$inc': {'c': 1}},
            upsert=True,
            safe=True
        )
        # If for some reason the counter collection has
        # no imgId entry, the find_and_modify returns
        # an empty dictionary on the first query
        c = int(cntr.get('c', 0))
        _id = str(Base62(c))

        output_filename = _id  # os.path.basename(infile)
        output_path = os.path.join(self.image_save_path, output_filename)
        if not os.path.exists(output_path):
            os.makedirs(output_path)

        print 'Image format was ', im.format
        # Try to detect if this is an animated GIF
        if (im.format == 'GIF'
                and 'GIF' in WHITELIST
                and im.info.get('loop') >= 0):
            result = _split_gif(im, output_filename, output_path, thumb_size=(90, 90))
        else:
            full_output_path = os.path.join(output_path, output_filename)
            result = _handle_image(im, full_output_path,  thumb_size=(90, 90))

        # Add the missing parameters to result
        result.update(dict(
            id=_id,
            format=im.format
        ))

        return result


def _iter_frames(im):
    transparent_bg = False

    # Save the palette from first frame for future use
    palette = im.getpalette()
    # Skip the first frame
    current_frame = im.convert('RGBA')
    # Fill the previous buffer in advance for the first loop
    buf = current_frame.load()
    for x in range(current_frame.size[0]):
        for y in range(current_frame.size[1]):
            # Check if the pixel is transparent
            # TODO: Make sure that 0 actually means transparency in all images
            if buf[x, y][3] == 0:
                # If we find a single pixel with transparent alpha channel
                # assume the img has a transparent background
                transparent_bg = True
                break

    # If it looks like there's a static background in the first image,
    # try to preserve it
    if not transparent_bg:
        print 'Treating the gif as having a static background!'
        prev_frame = current_frame
    else:
        print 'Treating the gif as having a transparent background!'

    yield current_frame

    try:
        i = 1
        im.seek(i)

        while True:
            # Fix palette for the current image frame
            im.putpalette(palette)
            current_frame = im.convert('RGBA')
            if not transparent_bg:
                # Image1, Image2, mask => Image
                current_frame = Image.composite(
                    current_frame, prev_frame, mask=current_frame
                    )
                prev_frame = current_frame

            yield current_frame
            i += 1
            im.seek(i)

    except EOFError:
        pass


def _split_gif(im, output_filename, output_path, thumb_size=(90, 90)):
    frames = 0

    for i, frame in enumerate(_iter_frames(im)):
        # If this is the first frame...
        if i == 0:
            result = _handle_image(
                im=frame,
                full_output_path=os.path.join(
                    output_path, output_filename),
                thumb_size=thumb_size,
                format='PNG'
                )
            frames += 1
        else:
            full_output_path = os.path.join(
                output_path, '{filename}_{index}'.format(
                    filename=output_filename, index=i))
            frame.save(full_output_path + '.png', format='PNG')
            frames += 1

    print frames
    # If there is more than 1 frame, ie if this is an animated gif

    result['frames'] = frames
    result['type'] = 'anim'

    return result


# def _convert_image(im, output_filename, output_path, thumb_size=(90, 90)):
#     full_output_path = os.path.join(output_path, output_filename)
#     return _handle_image(im, full_output_path, thumb_size)


def _handle_image(im, full_output_path, thumb_size, format=None):
    thumb_s = ImageOps.fit(
        image=im.copy(),
        size=thumb_size,
        method=Image.ANTIALIAS,
        bleed=0,
        centering=(0.5, 0.5))

    format = im.format if not format else format
    file_extension = format.lower()

    full_img_save_path = '{}.{}'.format(full_output_path, file_extension)
    thumb_save_path = '{}_s.{}'.format(full_output_path, file_extension)

    #print "SAVING IT TO ", thumb_save_path

    thumb_s.save(thumb_save_path, format=format)
    im.save(full_img_save_path, format=format)

    return {
        'full_save_path': full_img_save_path,
        'thumb_save_path': thumb_save_path,
        'name': os.path.basename(full_img_save_path),
        'size': os.path.getsize(full_img_save_path),
        'full': os.path.basename(full_img_save_path),
        'thumb': os.path.basename(thumb_save_path),
        'type': 'image'
    }


if __name__ == '__main__':
    import timeit
    t = timeit.Timer(
        "convert(infile=str(sys.argv[1]))",
        "from __main__ import convert_gif; import sys"
        )
    passes = 10
    print "{:.2} sec/pass".format(t.timeit(number=passes) / passes)
