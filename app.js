express = require('express');

app = express.createServer();
//app.use(express.bodyParser());
//app.use(express.cookieParser());


config = {};
config.TWILIO_ACCOUNT_SID = 'ACefb267919ab7c793e889ce40b8db2506';
config.TWILIO_AUTH_TOKEN = '6cb0a97591eaf94ca237572fe4472458';
config.HOST = 'twiliohackpack.herokuapp.com';
var TwilioClient = require('node-twilio').Client,
  Twiml = require('node-twilio').Twiml,
  client = new TwilioClient(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN , config.HOST, {
    "express" : app,
    "port" : process.env.PORT || config.port
  });

app.get("/", function(req, res) {
  var out = "hello", phone = client.getPhoneNumber('+14157234224');
  phone.setup(function() {
    phone.sendSms("+17033891424", out, {}, function(text) {
      console.log("Shit");
      res.send("done");
    });
  });
});

app.post("/incoming/sms", function(req, res) {
  logger.debug("Received an SMS.");
  logger.trace(sys.inspect(req.body));
  res.send("<Response><Sms>Thanks!</Sms></Response>");
});

app.listen(process.env.PORT || config.port);