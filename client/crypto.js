
/**
 * diffie hellman key exchange functions
 */
starbase.crypto.dh = function() 
{
};

starbase.crypto.dh = 
{  
  // p and g are taken from http://tools.ietf.org/html/rfc5114#section-2.3
  p: str2bigInt(
    "87A8E61DB4B6663CFFBBD19C651959998CEEF608660DD0F2" +
    "5D2CEED4435E3B00E00DF8F1D61957D4FAF7DF4561B2AA30" +
    "16C3D91134096FAA3BF4296D830E9A7C209E0C6497517ABD" +
    "5A8A9D306BCF67ED91F9E6725B4758C022E0B1EF4275BF7B" +
    "6C5BFC11D45F9088B941F54EB1E59BB8BC39A0BF12307F5C" +
    "4FDB70C581B23F76B63ACAE1CAA6B7902D52526735488A0E" +
    "F13C6D9A51BFA4AB3AD8347796524D8EF6A167B5A41825D9" +
    "67E144E5140564251CCACB83E6B486F6B3CA3F7971506026" +
    "C0B857F689962856DED4010ABD0BE621C3A3960A54E710C3" +
    "75F26375D7014103A4B54330C198AF126116D2276E11715F" +
    "693877FAD7EF09CADB094AE91E1A1597", 16, 2048),
    
  g: str2bigInt(
    "3FB32C9B73134D0B2E77506660EDBD484CA7B18F21EF2054" +
    "07F4793A1A0BA12510DBC15077BE463FFF4FED4AAC0BB555" +
    "BE3A6C1B0C6B47B1BC3773BF7E8C6F62901228F8C28CBB18" +
    "A55AE31341000A650196F931C77A57F2DDF463E5E9EC144B" +
    "777DE62AAAB8A8628AC376D282D6ED3864E67982428EBC83" +
    "1D14348F6F2F9193B5045AF2767164E1DFC967C1FB3F2E55" +
    "A4BD1BFFE83B9C80D052B985D182EA0ADB2A3B7313D3FE14" +
    "C8484B1E052588B9B7D2BBD2DF016199ECD06E1557CD0915" +
    "B3353BBB64E0EC377FD028370DF92B52C7891428CDC67EB6" +
    "184B523D1DB246C32F63078490F00EF8D647D148D4795451" +
    "5E2327CFEF98C582664B4C0F6CC41659", 16, 2048),

  /**
   * @brief generate the public key from a user secret
   */
  generate_publickey: function(secret) 
  {
    var a = str2bigInt(secret, 16, 2048);
    return bigInt2str(powMod(this.g, a, this.p), 16);
  },
  
  /**
   * @brief generate the sharedsecret from the user secret and remote public key
   */
  generate_sharedsecret: function(secret, remote_publickey) 
  {
    var a = str2bigInt(secret, 16, 2048);
    var B = str2bigInt(remote_publickey, 16, 2048);
    return bigInt2str(powMod(B, a, this.p), 16);
  }
};



/**
 * derivate keys from password and salt
 */
starbase.crypto.derivation = function() 
{
};

starbase.crypto.derivation = 
{
  // privatekey and authkey derivation differ in the number of iterations

  /**
   * @brief generate the privatekey
   * 
   * This function generates the privatekey.
   * 
   * @param password password from which privatekey should be derived
   * @param salt salt that should be used (optional)
   * @param count number of iterations that should be used (optional)
   * @param length size of the expected privatekey in bits (optional)
   */
  generate_privatekey: function(password, salt, count, length) 
  {
    salt = typeof(salt) !== 'undefined' ? salt : "j1t22tKUAjs1huwgFULp";
    count = typeof(count) !== 'undefined' ? count : 2000;
    if(typeof(length) != 'undefined')
      return sjcl.misc.pbkdf2(password, 
        sjcl.codec.utf8String.toBits(salt), count, length);
    else
      return sjcl.misc.pbkdf2(password, 
        sjcl.codec.utf8String.toBits(salt), count);
  },
  
  /**
   * @brief generate the authkey
   * 
   * This function generates the authkey.
   * 
   * @param password password from which authkey should be derived
   * @param salt salt that should be used (optional)
   * @param count number of iterations that should be used (optional)
   * @param length size of the expected privatekey in bits (optional)
   */
  generate_authkey: function(password, salt, count, length) 
  {
    salt = typeof(salt) !== 'undefined' ? salt : "Tj2a3kbixcDU1XHS10Aw";
    count = typeof(count) !== 'undefined' ? count : 1000;
    if(typeof(length) !== 'undefined')
      return sjcl.misc.pbkdf2(password, 
        sjcl.codec.utf8String.toBits(salt), count, length);
    else
      return sjcl.misc.pbkdf2(password, 
        sjcl.codec.utf8String.toBits(salt), count);
  }
};



/**
 * encryption and decryption with AES algorithm
 */
starbase.crypto.aes = function() 
{
};

starbase.crypto.aes = 
{
  /**
   * @brief encrypts object (through JSON), key derived from password and salt
   */
  encrypt_object: function(password, object, salt) 
  {
    var key = starbase.crypto.derivation.generate_privatekey(password, salt);
    return sjcl.json.encrypt(key, JSON.stringify(object));
  },
  
  /**
   * @brief encrypts object (through JSON), key derived from password and salt
   */
  decrypt_json: function(password, jsonstring, salt) 
  {
    var key = starbase.crypto.derivation.generate_privatekey(password, salt);
    return JSON.parse(sjcl.json.decrypt(key, jsonstring));
  }
};

starbase.crypto.encrypt_object = starbase.crypto.aes.encrypt_object;
starbase.crypto.decrypt_json = starbase.crypto.aes.decrypt_json;



/**
 * random number handling
 */
starbase.crypto.random = function() 
{
};

starbase.crypto.random = {

  counter_: 0,
  
  start_wait_entropy: function() 
  { console.log("start_wait_entropy original"); },
  
  wait_entropy: function(progress) 
  {console.log("wait_entropy original " + progress); },
  
  stop_wait_entropy: function() 
  { console.log("stop_wait_entropy original"); },
  
  register_callbacks: function(start, wait, stop)
  {
    this.start_wait_entropy = start;
    this.wait_entropy = wait;
    this.stop_wait_entropy = stop;
  },
  
  
  check_entropy()
  {
    if(this.counter_ < 5)
    {
      this.counter_++;
      this.wait_entropy(this.counter_);
      setTimeout("starbase.crypto.random.check_entropy()", 100);
    }
    else
    {
      this.stop_wait_entropy();
      this.counter_ = 0;
    }
  },
  
  get: function(num)
  {
    if(counter_ < 5)
    {
      this.start_wait_entropy();
      this.check_entropy();
    }
    return counter_;
  }
  
};
