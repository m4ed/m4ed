import unittest

#from pyramid import testing


class UtilTests(unittest.TestCase):
    def setUp(self):
        pass
    #     #request = testing.DummyRequest()
    #     self.config = testing.setUp()

    # def tearDown(self):
    #     testing.tearDown()

    def test_Base62(self):
        from m4ed.util.base62 import Base62
        b = Base62()
        self.assertEqual(str(b), '0')
        self.assertEqual(str(Base62('10')), '10')
        self.assertEqual(str(Base62(10)), 'a')
        self.assertEqual(str(Base62(1)), '1')
        self.assertRaises(TypeError, Base62, Base62())
        b += 11
        a = b + '10'
        self.assertEqual(str(a), '1b')

        c = Base62('Z') + Base62('Z')
        self.assertEqual(str(c), '1Y')

        c += Base62('1')
        self.assertEqual(str(c), '1Z')

        b.increment()
        self.assertEqual(int(b), 12)
        self.assertEqual(str(b), 'c')

        b += '1'
        self.assertEqual(str(b), 'd')

        self.assertEqual(unicode(b), u'd')


class FunctionalTests(unittest.TestCase):
    def setUp(self):
        #from uploadserver import main
        #import paste
        #import os
        from pyramid import paster
        # NOTE! Be sure to run `export TEST_INI='development.ini'` so that
        # os.environ can find it!
        app = paster.get_app('test.ini')  # os.environ['TEST_INI'])
        from webtest import TestApp
        self.testapp = TestApp(app)

    def _login(self, name='superuser', password='1234'):
        # Can be used to log into the app
        params = {
            'name': name,
            'password': password,
            'form.submitted': 'true'  # The value of this field does not matter
        }
        return self.testapp.post('/login', params=params)

    def test_root(self):
        self._login()
        self.testapp.get('/')
        #self.failUnless(res.status == '200 ok')

    def test_login_valid_password(self):
        # First a legit login
        self.testapp.reset()
        res = self.testapp.get('/login')
        form = res.form
        form['name'] = 'user'
        form['password'] = '1234'
        res = form.submit('form.submitted')
        self.failUnless(res.status == '302 Found')
        res = res.follow()
        self.failUnless(res.request.url == 'http://localhost/')

        # Duplicated login should redirect to root
        res = self.testapp.get('/login')
        self.failUnless(res.status == '302 Found')
        res = res.follow()
        self.failUnless(res.request.url == 'http://localhost/')

    def test_login_invalid_password(self):
        self.testapp.reset()
        res = self.testapp.get('/login')
        form = res.form
        form['name'] = 'user'
        form['password'] = 'invalid_password'
        res = form.submit('form.submitted')
        self.failUnless(res.request.url == 'http://localhost/login')

    def test_logout(self):
        self._login()
        # Normal logout
        res = self.testapp.get('/logout')
        self.failUnless(res.status == '302 Found')
        res = res.follow()
        self.failUnless(res.request.url == 'http://localhost/')

        # Logout without login
        res = self.testapp.get('/logout')
        self.failUnless(res.status == '302 Found')
        res = res.follow()
        self.failUnless(res.request.url == 'http://localhost/')

    def test_api_items_get(self):
        self._login()
        res = self.testapp.get('/api/items')
        json = res.json
        self.failUnless(len(json) > 0)
        _id = json[0].get('_id')
        res = self.testapp.get('/api/items/{0}'.format(_id))
        self.failUnless(str(res.json.get('_id')) == str(_id))

    def test_api_assets_get(self):
        self._login()
        res = self.testapp.get('/api/assets')
        json = res.json
        self.failUnless(len(json) > 0)
        object_id = json[0].get('_id')
        short_id = json[0].get('id')
        res = self.testapp.get('/api/assets/{0}'.format(object_id))
        self.failUnless(str(res.json.get('_id')) == str(object_id))

        res = self.testapp.get('/api/assets/{0}'.format(short_id))
        self.failUnless(str(res.json.get('id')) == str(short_id))

        self.failUnless(len(res.json.keys()) > 2)

    def test_api_items_put_valid(self):
        self._login()
        res = self.testapp.get('/api/items')
        json = res.json
        self.failUnless(len(json) > 0)
        object_id = json[0].get('_id')
        params = dict(
            _id=object_id,
            listIndex=0,
            type='lesson',
            title='something or other',
            desc='Nothing',
            text=''
        )
        self.testapp.put_json('/api/items/{0}'.format(object_id), params=params)

    def test_api_items_put_invalid(self):
        self._login()
        res = self.testapp.get('/api/items')
        json = res.json
        self.failUnless(len(json) > 0)
        object_id = json[0].get('_id')
        # First test non-json put
        params = dict(
            _id=object_id,
            listIndex=0,
            type='lesson',
            title='something or other',
            desc='Nothing',
            text=''
        )
        # Should return 406 Not Acceptable
        self.testapp.put('/api/items/{0}'.format(object_id), params=params, status=406)

        # Test a request with no _id supplied
        params = dict(
            listIndex=0,
            type='lesson',
            title='something or other',
            desc='Nothing',
            text=''
        )
        # Should return 503
        self.testapp.put_json('/api/items/{0}'.format(object_id), params=params, status=503)

    def test_api_assets_get_invalid_id(self):
        #self._login()
        self.testapp.get('/api/assets/#!@"()/[]}{+?\\&`', status=404)

    def test_misaka_post(self):
        import random
        import string
        char_list = string.letters + string.digits
        random_markdown = ''
        for i in range(100):
            random_markdown += random.choice(char_list)
        params = {
            'md': (r'$ \alpha = \beta $'             # Math syntax
                   r'$ \alpha = \beta $'             # Image cache hit
                   r'$ {} $'                         # To ensure a cache miss
                    '## Random heading'              # Normal markdown
                    '![Alt text goes here](id=4d)'   # Image tags
                    '![Alt text](id=nonexistant)').format(random_markdown)
        }
        self.testapp.post('/misaka', params=params, status=403)
        self._login()
        self.testapp.post('/misaka', params=params)

    def test_get_asset_thumb_image_valid_id(self):
        self._login()
        res = self.testapp.get('/api/assets')
        json = res.json
        short_id = json[0].get('id')
        res = self.testapp.get('/api/assets/{id}/thumb'.format(id=short_id), status=303)
        self.failUnless('rackcdn.com' in res)

        res = self.testapp.get('/api/assets/{id}/image'.format(id=short_id), status=303)
        self.failUnless('rackcdn.com' in res)
        #res.showbrowser()

    def test_api_item_get_not_logged_in(self):
        self.testapp.reset()
        self.testapp.get('/api/items', status=403)

    def test_api_asset_get_not_logged_in(self):
        self.testapp.reset()
        self.testapp.get('/api/assets', status=403)
