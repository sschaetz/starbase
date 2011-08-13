
function _loaded()
{
  sjcl.random.startCollectors();
  
  starbase.show_contact_list();
  starbase.show_messagelist(true);
}


$(document).ready(function() 
{  
  // load data
  $.getJSON('data.json', function(data) 
  {
    // decrypt data
    window.starbase.data = data;
    // load messages
    $.getJSON('messages.json', function(data) 
    {
      // decrypt messages
      window.starbase.messages = data;
      _loaded();
    });
  });
  
});
