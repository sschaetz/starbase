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

  def test_001_create_users(self):
    url = self.domain + "createuser"
    result = fire_request_json(url, {'user': 'seb', 'authkey': 'sebauthkey'})
    self.assertEqual(result, "OK")
    result = fire_request_json(url, {'user': 'clau', 'authkey': 'clauauthkey'})
    self.assertEqual(result, "OK")
    
    # create the same user, expect http error
    self.assertRaises(urllib2.HTTPError, fire_request_json, 
      url, {'user': 'clau', 'authkey': 'clauauthkey'})
  
  def test_002_store_data(self):
    # store data
    result = fire_request_json(self.domain + "seb/store_data", 
      {'authkey': 'sebauthkey', 'data': 'mydata'})
    self.assertEqual(result, "OK")
    # load data
    result = fire_request_json(self.domain + "seb/load_data/sebauthkey")
    self.assertEqual(result, "mydata")
    
  def test_003_add_accesstokens(self):
    # add 1 accesstoken
    result = fire_request_json(self.domain + "seb/add_accesstokens", 
      {'authkey': 'sebauthkey', 'accesstokens': json.dumps(["token1"])})
    self.assertEqual(result, "OK")
    # add multiple accesstokens
    result = fire_request_json(self.domain + "seb/add_accesstokens", 
      {
        'authkey': 'sebauthkey', 
        'accesstokens': json.dumps(["token2", "token3"])
      })
    self.assertEqual(result, "OK")
    # add token for testing purposes
    result = fire_request_json(self.domain + "seb/add_accesstokens", 
      {'authkey': 'sebauthkey', 'accesstokens': json.dumps(["token4"])})
    self.assertEqual(result, "OK")
    
  def test_004_remove_accesstokens(self):
    # remove 1 accesstoken
    result = fire_request_json(self.domain + "seb/remove_accesstokens", 
      {'authkey': 'sebauthkey', 'accesstokens': json.dumps(["token1"])})
    self.assertEqual(result, "OK")
    # remove multiple accesstokens
    result = fire_request_json(self.domain + "seb/remove_accesstokens", 
      {
        'authkey': 'sebauthkey', 
        'accesstokens': json.dumps(["token2", "token3"])
      })
    self.assertEqual(result, "OK")
    
  def test_005_send_message(self):
    # send message
    result = fire_request_json(self.domain + "seb/inbox", 
      {'accesstoken': 'token4', 'message': 'HI!'})
    self.assertEqual(result, "OK")
    
  def test_006_load_messages(self):
    # get messages
    result = fire_request_json(self.domain + "seb/load_messages", 
      {'authkey': 'sebauthkey'})
    self.assertEqual(result[0][0], "HI!")
    self.assertEqual(result[0][1], "token4")

  def test_007_send_messages(self):
    # send messages
    result = fire_request_json(self.domain + "seb/inbox", 
      {'accesstoken': 'token4', 'message': 'message2'})
    self.assertEqual(result, "OK")
    result = fire_request_json(self.domain + "seb/inbox", 
      {'accesstoken': 'token4', 'message': 'message3'})
    self.assertEqual(result, "OK")
    
  def test_008_load_messages(self):
    # get messages
    result = fire_request_json(self.domain + "seb/load_messages", 
      {'authkey': 'sebauthkey'})
    self.assertEqual(result[0][0], "message2")
    self.assertEqual(result[0][1], "token4")
    self.assertEqual(result[1][0], "message3")
    self.assertEqual(result[1][1], "token4")

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

