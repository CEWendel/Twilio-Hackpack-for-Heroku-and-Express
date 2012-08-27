var express = require('express')
	, pub = __dirname + '/public';

/* Create the Express app */
app = express.createServer();
app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.static(pub));
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
});

/* Create a hash to store our environment variables in needed to create the client */
config = {};
config.TWILIO_ACCOUNT_SID = 'ACebc0f6959d2d4c96ab4b51ff56bab89f';
config.TWILIO_AUTH_TOKEN = 'ee115a864487164c053253f54282a4d6';
config.TWILIO_CALLER_ID = process.env.TWILIO_CALLER_ID;
config.HOST = 'http://twiliohackpacknodefinal.herokuapp.com';
config.port = process.env.PORT || 5000;

/* Set up the Twilio Rest Client */
var TwilioClient = require('heroku-twilio').Client,
  Twiml = require('heroku-twilio').Twiml,
  client = new TwilioClient(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN , config.HOST, {
    "express" : app
  });

/* Set up the PhoneNumber object with our CallerId */
var phone = client.getPhoneNumber('+17035968908');

/* Create functions to be called when Voice and Sms endpoints are reached */
var onIncomingCall = function(reqParams, res){
  res.append(new Twiml.Say("Hello"));
  res.send();
}

var onIncomingSms = function(reqParams, res){
  res.append(new Twiml.Sms("Thanks for texting!"));
  res.send();
}

/* Call the setup function on the PhoneNumber object to set up our Voice and Sms endpoints */
phone.setup(function() {
  app.listen(config.port, function(){
      return console.log('Listening on ' + config.port);
  });

  phone.on('incomingCall', function(reqParams, response){
     return onIncomingCall(reqParams, response);
   });
});

/* Base route */
app.get("/", function(req, res){
  res.render('index');
});

/* Endpoint to make a call using the Twilio Rest Client. By default calls a previously configured number */
app.get("/makeCall", function(req, res) {
  var number = '+17033891424' // Set this equal to the number you want to call
  if(!number){
    res.send('You need to set a phone number to call in app.js');
  }else{
  	phone.makeCall(number, null, function(call){
      res.send('Made call');
    	call.on('answered', function(request, response){
    		response.append(new Twiml.Say("Hello"));
    		response.send();
    	});
    	call.on('ended', function(req, resp){
    		console.log("call ended");
    	});
    });
  }
});

/* Endpoint to send an sms using the Twilio Rest Client. By default texts a previously configured number */
app.get("/sendSms", function(req, res){
  var number; // Set this equal to the number you want to text
  if(!number){
    res.send('You need to set a phone number to call in app.js');
  }else{
    phone.sendSms(number, 'Jeah!', null, function(sms){
      res.send('Sent sms to ' + number);
    });
  }
});

/* Voice endpoint for Twilio Client app. NOT used for Twilio Phone Number endpoint */
app.all("/voice", function(req,res){
  var r = new Twiml.Response();
  r.append(new Twiml.Say('Hello! This is your voice endpoint for your Twilio app'));
  res.send(r.toString());
});
