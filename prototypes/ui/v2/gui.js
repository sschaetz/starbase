

// proudly stolen from
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference:Global_Objects:Date 
function ISODateString(d)
{
  d=new Date(d);
 function pad(n){return n<10 ? '0'+n : n}
 return d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate())+'T'
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds())+'Z'
}


var starbase = new function() {
  this.data = 0;
  this.messages = 0;
  this.current_user = 0;
  
  // ___________________________________________________________________________
  
  // crypto stuff
  
  // diffie hellman modp group
  this.p = new sjcl.bn(
    "B10B8F96A080E01DDE92DE5EAE5D54EC52C99FBCFB06A3C6" +
    "9A6A9DCA52D23B616073E28675A23D189838EF1E2EE652C0" +
    "13ECB4AEA906112324975C3CD49B83BFACCBDD7D90C4BD70" +
    "98488E9C219A73724EFFD6FAE5644738FAA31A4FF55BCCC0" +
    "A151AF5F0DC8B4BD45BF37DF365C1A65E68CFDA76D4DA708" +
    "DF1FB2BC2E4A4371");

  this.g = new sjcl.bn(
    "A4D1CBD5C3FD34126765A442EFB99905F8104DD258AC507F" +
    "D6406CFF14266D31266FEA1E5C41564B777E690F5504F213" +
    "160217B4B01B886A5E91547F9E2749F4D7FBD7D3B9A92EE1" +
    "909D0D2263F80A76A6A24C087A091F531DBF0A0169B6A28A" +
    "D662A4D18E73AFA32D779D5918D08BC8858F4DCEF97C2A24" +
    "855E6EEB22B3B2E5");
  
  this.diffie_public = function(secret)
  {
    return window.starbase.g.powermod(secret, window.starbase.p);
  }
  
  this.diffie_secret = function(public, secret)
  {
    return public.powermod(secret, window.starbase.p);
  }
  
  this.diffie_test = function()
  {
    var a = new sjcl.bn(
    "A4D1CBD5C3FD34126765A442EFB99905F8104DD258AC507F" +
    "D6406CFF14266D31266FEA1E5C41564B777E690F5504F213" +
    "160217B4B01B886A5EF9E2749F4D7FBD7D3B9A92EE1" +
    "909D0D2263F80A76A6A24C087A091F531DBF0A0169B6A28A" +
    "D662A4D18E73AFA32D779D5918D08BC8858F4DCEF97C2A24" +
    "855E6EEB22B3B2E5");
    
    //var b = new sjcl.bn(sjcl.random.randomWords(8));
    
    var x = this.g.powermod(this.p, a);
    console.log(x.toString());
    //var A = this.diffie_public(a);
    //var B = this.diffie_public(b);
    
    //var sa = this.diffie_secret(B, a);
    //var sb = this.diffie_secret(A, b);
  }
  
  
  
  
  
  
  // ___________________________________________________________________________
  
  /**
   * translate a user id to an array offset in the contact table
   */
  this.array_id_from_uid = function(uid)
  {
    var ret_key = -1;
    $.each(_s.data.contacts.c, function(key, contact) 
    {
      if(contact.id == uid)
      {
        ret_key = key;
        return;
      }
    });
    return ret_key;
  }
  
  // ___________________________________________________________________________
  
  this.message_click = function(id, recv)
  {
    this.show_reader(id, recv);
  }
  
  this.show_contactprofile = function(id)
  {
    this.show_contact(id);
  }
  
  // ___________________________________________________________________________
  
  
  // ___________________________________________________________________________
  
  this.show_contact_list = function()
  {
    var contact_div = $("#contacts");
    contact_div.empty();
    
    var contacts = [];
    
    $.each(this.data.contacts.c, function(key, contact) 
    {
      contacts.push('<li><a href="javascript:void(0);" ' + 
        'onclick="window.starbase.show_contactprofile(' + key + ');">' + 
        contact.a + '</a></li>');
    });
    
    $('<ul/>', {
      html: contacts.join('')
    }).appendTo(contact_div);
    
  };
  
  this.show_contactprofile = function(id) 
  {
    $("#mailbox > li > a").removeClass("selected");
    $("#main > div").hide();
    var profile_div = $("#contactprofile");

    var p = this.data.contacts.c[id];
    
    $("#contactprofile_alias").html(p.a);
    $("#contactprofile_name").html(p.n);
    $("#contactprofile_location").html(p.l);
    $("#contactprofile_id").html(p.id);
    $("#contactprofile_ss").html(p.ss);
    $("#contactprofile_rak").html(p.rak);
    $("#contactprofile_lak").html(p.lak);
    
    this.current_user = p.id;
    
    profile_div.show();
  };
  
  this.show_composer = function() 
  {
    $("#main > div").hide();
    
    var c = this.data.contacts.c[this.array_id_from_uid(this.current_user)];
    $("#composer_to").html(c.a);
    $("#subject").val("");
    $("#message").val("");
    $("#composer").show();
  };

  this.show_requester = function() 
  {
    $("#main > div").hide();
    
    $("#requesturl").val("");
    $("#requestalias").val("");
    $("#requestmessage").val("");
    $("#requester").show();
  };  

  /**
   * show a message (true if received message, false else)
   */
  this.show_reader = function(id, recv) 
  {
    $("#mailbox > li > a").removeClass("selected");
    $("#main > div").hide();
    var reader = $("#reader");
    
    reader.empty();
    
    var readerentry = [];
    
    // received message
    if(recv == true)
    {
      var m = this.messages.m[id];
      var c = this.data.contacts.c[this.array_id_from_uid(m.uid)];
      readerentry.push('<li id="readersubject">' + m.s + '</li>');
      readerentry.push('<li id="readerfromto"> From ' + c.a + 
        ' to me, received <time class="timeago" datetime="' + 
        ISODateString(m.ts) + '">' + ISODateString(m.ts) + '</time></li>');
      readerentry.push('<li>' + m.t + '</li>');
      readerentry.push('<li><button type="submit" onclick="_s.show_composer()">Reply</button></li>');
      this.current_user = c.id;
    }
    // sent message
    else
    {
      var m = this.data.sentmessages.m[id];
      var c = this.data.contacts.c[this.array_id_from_uid(m.uid)];
      readerentry.push('<li id="readersubject">' + m.s + '</li>');
      readerentry.push('<li id="readerfromto"> From me to ' + c.a + 
        ', sent <time class="timeago" datetime="' + ISODateString(m.ts) + '">' + 
        ISODateString(m.ts) + '</time></li>');
      readerentry.push('<li>' + m.t + '</li>');
      readerentry.push('<li><button type="submit" onclick="_s.show_composer()">Followup</button></li>');
      this.current_user = c.id;
    }
    
    $('<ul/>', {
      html: readerentry.join(''),
      id: 'readerelements'
    }).appendTo(reader);
    
    reader.show();
  };
  
  
  /**
   * show the message list
   */
  this.show_messagelist = function(recv) 
  {
    // iterate over messages and create content of an <ul> and append it to div
    $("#main > div").hide();
    $("#mailbox > li > a").removeClass("selected");
    
    var messagelist = $("#messagelist");
    messagelist.empty();
      
    var messages = [];
    // received message
    if(recv == true)
    {
      $("#mailbox-inbox").addClass("selected");
      $.each(this.messages.m, function(key, message) 
      {
        var c = _s.data.contacts.c[_s.array_id_from_uid(message.uid)];
        messages.push('<li><a href="javascript:void(0);" ' + 
          'onclick="window.starbase.message_click(' + key + ', true);">' + 
          c.a + ' - ' + message.s + 
          '</a> received <time class="timeago" datetime="' + 
          ISODateString(message.ts) + '">' + 
          ISODateString(message.ts) + '</time></li>');
      });
    }
    // sent messages
    else
    {
      $("#mailbox-sent").addClass("selected");
      $.each(this.data.sentmessages.m, function(key, message) 
      {
        var c = _s.data.contacts.c[_s.array_id_from_uid(message.uid)];
        messages.push('<li><a href="javascript:void(0);" ' + 
          'onclick="window.starbase.message_click(' + key + ', false);">' + 
          c.a + ' - ' + message.s + 
          '</a> sent <time class="timeago" datetime="' + 
          ISODateString(message.ts) + '">' + 
          ISODateString(message.ts) + '</time></li>');
      });
    }
    
    $('<ul/>', {
      html: messages.join('')
    }).appendTo(messagelist);
    
    messagelist.show(); 
  };
  
  
  
  this.test_entropy_overlay = function()
  {
    $("#entropy_overlay").show();
    $("#entropy_overlay_message").show();
    setTimeout(
      "$(\"#entropy_overlay_message\").hide(); $(\"#entropy_overlay\").hide();", 
      5000);
  }
}

var _s = window.starbase;


