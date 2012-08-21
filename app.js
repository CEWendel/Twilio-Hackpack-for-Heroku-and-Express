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
config.TWILIO_ACCOUNT_SID = 'ACebc0f6959d2d4c96ab4b51ff56bab89f';
config.TWILIO_AUTH_TOKEN = 'ee115a864487164c053253f54282a4d6';
config.HOST = 'twiliohackpacknodefinal.herokuapp.com';
config.port = process.env.PORT || 5000;

var TwilioClient = require('heroku-twilio').Client,
  Twiml = require('heroku-twilio').Twiml,
  client = new TwilioClient(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN , config.HOST, {
    "express" : app
  });

var out = "hello", phone = client.getPhoneNumber('+17032910126');

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
    'caller_id is ' + process.env.TWILIO_CALLER_ID);
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


app.get('/index', function(req, res){
	res.render('index');
});

app.post("/voice", function(req,res){
  res.send("Jeah");
});

app.post("/voicetest", function(req,res){
  phone.on('incomingCall', function(request, response){
      res.append(new Twiml.Say('Thanks for calling! I think you are beautiful!'));
      res.send();
  });
});

app.post("/incoming/sms", function(req, res) {
  console.log("incoming sms!");
  res.send("<Response><Sms>Thanks!</Sms></Response>");
});

app.get("/incoming/sms", function(req, res){
	res.send("<Response><Sms>Thanks!</Sms></Response>");
});
