var express = require('express')
	, pub = __dirname + '/public';

app = express.createServer();
app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.static(pub));
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
});

config = {};
config.TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
config.TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
config.TWILIO_CALLER_ID = process.env.TWILIO_CALLER_ID;
config.HOST = process.env.TWILIO_HOST;
config.port = process.env.PORT || 5000;

var TwilioClient = require('heroku-twilio').Client,
  Twiml = require('heroku-twilio').Twiml,
  client = new TwilioClient(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN , config.HOST, {
    "express" : app
  });

/* Set up the PhoneNumber object with our CallerId */
var phone = client.getPhoneNumber(config.TWILIO_CALLER_ID);

var onIncomingCall = function(reqParams, res){
  res.append(new Twiml.Say("Hello"));
  res.send();
}

var onIncomingSms = function(reqParams, res){
  res.append(new Twiml.Sms("Thanks for texting!"));
  res.send();
}

phone.setup(function() {
  app.listen(config.port, function(){
    return console.log('Listening on ' + config.port);
  });

  phone.on('incomingCall', function(reqParams, response){
    return onIncomingCall(reqParams, response);
  });

  phone.on('incomingSms', function(reqParams, response){
    return onIncomingSms(reqParams, response);
  });
});

app.get("/", function(req, res){
  res.render('index');
});

app.get("/testVars", function(req,res){
  res.send('account sid is ' + process.env.TWILIO_ACCOUNT_SID + 
    'auth_token is ' + process.env.TWILIO_AUTH_TOKEN + 
    'app_sid is ' + process.env.TWILIO_APP_SID + 
    'caller_id is ' + process.env.TWILIO_CALLER_ID +
    'host is ' + process.env.TWILIO_HOST);
});

app.get("/makeCall", function(req, res) {
	phone.makeCall('+17032910026', null, function(call){
      res.send('Made call');
  		call.on('answered', function(request, response){
  			response.append(new Twiml.Say("Hello"));
  			response.send();
  		});
  		call.on('ended', function(req, resp){
  			console.log("call ended");
  	 	});
  	});
});

app.get("/sendSms", function(req, res){
  var number = '+17032910026';
  phone.sendSms(number, 'Jeah!', null, function(sms){
    res.send('Sent sms to ' + number);
  });
});

app.all("/voice", function(req,res){
  var r = new Twiml.Response();
  r.append(new Twiml.Say('Hello! This is your voice endpoint for your Twilio app'));
  res.send(r.toString());
});

app.all("/sms", function(req,res){
  var r = '<Response><Sms>Hello! This is the sms endpoint for your Twilio app</Say></Response>'
  res.send(r);
});
