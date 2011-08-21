
import ConfigParser
import sqlite3
import json

from werkzeug.wrappers import Response, Request
from werkzeug.routing import Map, Rule
from werkzeug.exceptions import \
  HTTPException, NotFound, Unauthorized, BadRequest
  
from werkzeug.wsgi import SharedDataMiddleware
from werkzeug.wrappers import CommonRequestDescriptorsMixin, BaseRequest
import logging
import datetime

from starbase.utils import file_exists, create_user

def error_response(code, message):
  r = [code, message]
  return Response(json.dumps(r), content_type="application/json")

def success_response():
  return Response(json.dumps("OK"), content_type="application/json")

def data_response(data):
  return Response(json.dumps(data), content_type="application/json")

class starbase(object):

  def __init__(self):
    self.config = ConfigParser.RawConfigParser()
    self.config.read('../config.cfg')
    self.user_data_folder = self.config.get('general', 'user_data_folder')
    logging.basicConfig(filename='server.log',level=logging.DEBUG)
    logging.info('Started server at ' + str(datetime.datetime.now()))
    
    # map urls to functions
    self.url_map = Map([
      Rule('/', endpoint='root'),
      Rule('/<user>/', endpoint='default'),
      Rule('/<user>/load_data/<authkey>', endpoint='load_data'),
      Rule('/<user>/store_data', endpoint='store_data'),
      Rule('/<user>/load_messages', endpoint='load_messages'),
      Rule('/<user>/inbox/<accesstoken>', endpoint='inbox'),
      Rule('/<user>/add_accesstokens', endpoint='add_accesstokens'),
      Rule('/<user>/remove_accesstokens', endpoint='remove_accesstokens'),
      Rule('/createuser', endpoint='createuser'),
    ])
    
    # those functions do not require a username
    self.no_user = ["root", "createuser"]

  def dispatch_request(self, request):
    adapter = self.url_map.bind_to_environ(request.environ)
    try:
      endpoint, values = adapter.match()

      # for some requests a user is required
      if endpoint not in self.no_user:
        if not self.user_exists(values['user']):
          raise NotFound()
        else:
          # if a user is provided open the database
          self.db = \
            sqlite3.connect(self.user_data_folder + values['user'] + '.sql')
      
      return getattr(self, 'on_' + endpoint)(request, **values)
    except HTTPException, e:
      return e

  def wsgi_app(self, environ, start_response):
    request = Request(environ)
    response = self.dispatch_request(request)
    return response(environ, start_response)

  def __call__(self, environ, start_response):
    return self.wsgi_app(environ, start_response)
    
  
  
  # here are the responders -----
  
  def on_root(self, request):
    return Response("on_root")
    
  def on_default(self, request, user):
    return Response("on_default " + user)

  def on_load_data(self, request, user, authkey):
    self.user_authenticate(authkey)
    return data_response(self.get_data())
    
  def on_store_data(self, request, user):
    if not 'authkey' in request.form:
      raise Unauthorized()
    if not 'data' in request.form:
      raise BadRequest()
      
    self.user_authenticate(request.form['authkey'])
    self.set_data(request.form['data'])
    return success_response()
    
  def on_load_messages(self, request, user):
    if not 'authkey' in request.form:
      raise Unauthorized()
    self.user_authenticate(request.form['authkey'])
    return Response("load_messages")
    
  def on_inbox(self, request, user, accesstoken):
    return Response("inbox " + user + " " + accesstoken)
    
  def on_add_accesstokens(self, request, user):
    return Response("add_accesstokens")
 
  def on_remove_accesstokens(self, request, user):
    return Response("remove_accesstokens")
    
  # create a new user  
  def on_createuser(self, request):
    if not 'user' in request.form or not 'authkey' in request.form:
      raise BadRequest("missing user or authkey")
      
    user = request.form['user']
    authkey = request.form['authkey']
    if self.user_exists(user):
      raise BadRequest("user already exists")
    create_user(user, authkey)
    return success_response()
    
    
    
    
  # some utility functions -----
  
  def user_exists(self, user):
    user_database = self.user_data_folder + user + '.sql'
    return file_exists(user_database)
  
  # database functions -----
  
  def user_authenticate(self, authkey):
    c = self.db.cursor()
    c.execute('SELECT 1 FROM admin WHERE authkey = ?', [authkey])
    rows = len(c.fetchall())
    c.close()
    if rows != 1:
      raise Unauthorized()
  
  def get_data(self):
    c = self.db.cursor()
    c.execute('SELECT data FROM blobs WHERE name = ?', ["datablob"])
    row = c.fetchone()
    c.close()
    return row[0]

  def set_data(self, data):
    self.db.execute('UPDATE blobs SET data = ? WHERE name = ?', 
      [data, "datablob"])
    self.db.commit()
    return
    

def create_app():
  app = starbase()
  return app
    

if __name__ == '__main__':
  from werkzeug.serving import run_simple
  app = create_app()
  run_simple('127.0.0.1', 5000, app, use_debugger=True, use_reloader=True)
    
    
