import ConfigParser
import os
import urllib
import urllib2
import json
import unittest
import time
import shutil

# helper functions -----


# send post to url with data
def fire_request_json(url, data=None):
  if data != None:
    data = urllib.urlencode(data)
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req)
    return json.loads(response.read())
  else:
    response = urllib2.urlopen(url)
    return json.loads(response.read())
  

# basic unit test -----

class basic_test(unittest.TestCase):

  def setUp(self):
    self.config = ConfigParser.RawConfigParser()
    self.config.read('../../config.cfg')
    self.user_data_folder = self.config.get('general', 'user_data_folder')
    self.domain = self.config.get('general', 'domain')

  def test_create_users(self):
    url = self.domain + "createuser"
    result = fire_request_json(url, {'user': 'seb', 'authkey': 'sebauthkey'})
    self.assertEqual(result, "OK")
    result = fire_request_json(url, {'user': 'clau', 'authkey': 'clauauthkey'})
    self.assertEqual(result, "OK")
    
    # create the same user, expect http error
    self.assertRaises(urllib2.HTTPError, fire_request_json, 
      url, {'user': 'clau', 'authkey': 'clauauthkey'})
  
  def test_store_data(self):
    # store data
    result = fire_request_json(self.domain + "seb/store_data", 
      {'authkey': 'sebauthkey', 'data': 'mydata'})
    self.assertEqual(result, "OK")
    # load data
    result = fire_request_json(self.domain + "seb/load_data/sebauthkey")
    self.assertEqual(result, "mydata")
    
# clear create or clear folder
def setup():
  # get configuration information
  config = ConfigParser.RawConfigParser()
  config.read('../../config.cfg')
  user_data_folder = config.get('general', 'user_data_folder')
  domain = config.get('general', 'domain')
  
  # create or clear the folder that stores user data
  if not os.path.exists(user_data_folder):
    print "create dir"
    os.makedirs(user_data_folder)
  else:
    shutil.rmtree(user_data_folder)
    os.makedirs(user_data_folder)

if __name__ == '__main__':
  setup()
  unittest.main()

