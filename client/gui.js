/**
 * registration handling
 */
starbase.gui.registration = function() 
{
};

starbase.gui.registration = {

  register: function() 
  { 
    // check if password is ok
    if(!starbase.gui.registration.check_password())
    {
      return;
    }

    $.ajax({
      type: "POST",
      url: starbase.config.host + "/createuser",
      data: { "user": "john", "authkey": "2pm" },
      success: function(response) 
      {
        console.log("Yay! " + response);
      },
      error: function(response)
      {
        console.log("Nay! " + response);
      }
    });
  },
  
  check_password: function() 
  { 
    if($("#password").val() != $("#repassword").val() ||
      $("#password").val() == "")
    {
      var sbox = $("#regstatusbox");
      sbox.html("There is a problem with the password.");
      sbox.css("visibility", "visible");
      return false;
    }
    return true;
  }
}
