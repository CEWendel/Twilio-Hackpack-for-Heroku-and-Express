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
config.HOST = 'twilionodedifferent3.herokuapp.com';
config.port = process.env.PORT || 5000;

var TwilioClient = require('heroku-twilio').Client,
  Twiml = require('heroku-twilio').Twiml,
  client = new TwilioClient(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN , config.HOST, {
    "express" : app
  });

var phone = client.getPhoneNumber('+17035968221');

var onCall = function(reqParams, res){
  res.append(new Twiml.Say("Hello"));
  res.send();
}

var onSms = function(reqParams, res){
  res.append(new Twiml.Sms("Yo yo yo"));
  res.send();
}

phone.setup(function() {
    app.listen(config.port, function(){
        return console.log('Listening on ' + config.port);
    });

    phone.on('incomingSms', function(reqParams, response){
      return onSms(reqParams, response);
    });

    phone.on('incomingCall', function(reqParams, response){
      return onCall(reqParams, response);
    });
});

app.get("/", function(req, res){
  res.render('index');
});

/* Endpoint to make a call using the Twilio Rest Client. By default calls a previously configured number */
app.get("/makeCall", function(req, res) {
  var number; // Set this equal to the number you want to call
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
