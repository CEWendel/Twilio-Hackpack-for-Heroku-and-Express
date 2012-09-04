var express = require('express')
  , pub = __dirname + '/public';

app = express.createServer();
app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.static(pub));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
});

/* Set up hash to store our Twilio account info in */
config = {};
config.TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
config.TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
config.HOST = process.env.TWILIO_HOST;
config.caller_id = process.env.TWILIO_CALLER_ID;
config.port = process.env.PORT || 5000;


/* Create the Twilio Client and Twiml objects */
var TwilioClient = require('heroku-twilio').Client,
  Twiml = require('heroku-twilio').Twiml,
  client = new TwilioClient(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN , config.HOST, {
    "express" : app
  });

/* Get the caller_id and create a phone number object with it */
var phone = client.getPhoneNumber(config.caller_id);

/* Function that is called when caller_id receives an incoming call */
var onCall = function(reqParams, res){
  res.append(new Twiml.Say("Hello, thanks for calling your new Twilio phone number"));
  res.send();
}

/* Function that is called when caller_id receives an incoming sms */
var onSms = function(reqParams, res){
  res.append(new Twiml.Sms("Hello, thanks for texting your new Twilio phone number"));
  res.send();
}

/* Setup function uses to setup endpoints for our caller_id */
phone.setup(function() {
  phone.on('incomingSms', function(reqParams, response){
    return onSms(reqParams, response);
  });

  phone.on('incomingCall', function(reqParams, response){
    return onCall(reqParams, response);
  });
});

/* Default route endpoint */
app.get("/", function(req, res){
  res.render('index');
});

/* Endpoint to make a call using the Twilio Rest Client */
app.get("/makeCall", function(req, res) {
  var number; // Set this equal to the number you want to call
  if(!number){
    res.send('You need to set a phone number to call in app.js');
  }else{
    phone.makeCall(number, null, function(call){
      res.send('Calling ' + number);
      call.on('answered', function(request, response){
        response.append(new Twiml.Say("Hello! This is your new twilio phone number calling you!"));
        response.send();
      });
      call.on('ended', function(req, resp){
        console.log("call ended");
      });
    });
  }
});

/* Endpoint to send an sms using the Twilio Rest Client */
app.get("/sendSms", function(req, res){
  var number; // Set this equal to the number you want to text
  if(!number){
    res.send('You need to set a phone number to call in app.js');
  }else{
    phone.sendSms(number, 'Hello, this is your new twilio phone number texting you!', null, function(sms){
      res.send('Sending sms to ' + number);
    });
  }
});

/* Voice endpoint for Twilio Client app. NOT used for Twilio Phone Number endpoint */
app.all("/voice", function(req,res){
  var r = new Twiml.Response();
  r.append(new Twiml.Say('Hello! This is your voice endpoint for your Twilio app'));
  res.send(r.toString());
});

app.listen(process.env.PORT || config.port);
