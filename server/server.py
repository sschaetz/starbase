
import ConfigParser

from werkzeug.wrappers import Response, Request
from werkzeug.routing import Map, Rule
from werkzeug.exceptions import HTTPException, NotFound
from werkzeug.wsgi import SharedDataMiddleware
from werkzeug.wrappers import CommonRequestDescriptorsMixin, BaseRequest

from starbase.utils import file_exists


class starbase(object):

  def __init__(self):
    self.config = ConfigParser.RawConfigParser()
    self.config.read('../config.cfg')
    self.user_data_folder = self.config.get('general', 'user_data_folder')
    
    # map urls to functions
    self.url_map = Map([
      Rule('/<user>/', endpoint='default'),
      Rule('/<user>/load_data', endpoint='load_data'),
      Rule('/<user>/store_data', endpoint='store_data'),
      Rule('/<user>/load_messages', endpoint='load_messages'),
      Rule('/<user>/inbox', endpoint='inbox'),
      Rule('/<user>/add_accesstokens', endpoint='add_accesstokens'),
      Rule('/<user>/remove_accesstokens', endpoint='remove_accesstokens')
    ])

  def dispatch_request(self, request):
    adapter = self.url_map.bind_to_environ(request.environ)
    try:
      endpoint, values = adapter.match()
      # only proceed if user exists
      if not self.user_exists(values['user']):
        raise NotFound()
        
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
  
  
  def on_default(self, request, user):
    return Response("on_default " + user)

  def on_load_data(self, request, user):
    return Response("load_data")
    
  def on_store_data(self, request, user):
    return Response("store_data")
    
  def on_load_messages(self, request, user):
    return Response("load_messages")
    
  def on_inbox(self, request, user):
    return Response("inbox")
    
  def on_add_accesstokens(self, request, user):
    return Response("add_accesstokens")
 
  def on_remove_accesstokens(self, request, user):
    return Response("remove_accesstokens")
    
  
  # some utility functions -----
  
  def user_exists(self, user):
    user_database = self.user_data_folder + user + '.sql'
    print user_database
    return file_exists(user_database)
    

def create_app():
  app = starbase()
  return app
    

if __name__ == '__main__':
  from werkzeug.serving import run_simple
  app = create_app()
  run_simple('127.0.0.1', 5000, app, use_debugger=True, use_reloader=True)
    
    
