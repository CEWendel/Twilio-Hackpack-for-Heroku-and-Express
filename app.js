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
config.port = 5000;

var TwilioClient = require('heroku-twilio').Client,
  Twiml = require('heroku-twilio').Twiml,
  client = new TwilioClient(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN , config.HOST, {
    "express" : app
  });

var out = "hello", phone = client.getPhoneNumber('+17032910126');

app.get("/", function(req, res) {
  phone.setup(function() {
	phone.makeCall('+17033891424', null, function(call){
  		res.send("Made call");
  		call.on('answered', function(request, response){
  			response.append(new Twiml.Say("Hello"));
  			response.send();
  		});
  		call.on('ended', function(req, resp){
  			console.log("call ended");
  	 	});
  	});
  });
});

app.get('/index', function(req, res){
	res.render('index');
});
/*
app.get("/sms", function(req,res){
	phone.sendSms("+17033891424", "Hello", {}, function(text){
		res.send("Text sent");
	})
});	
*/
app.get("/voice", function(req,res){
  //res.append(new Twiml.say('Hey thanks for calling!'));
  //res.send();
  //res.send('account sid is ' + process.env.TWILIO_ACCOUNT_SID);
  res.append(new Twiml.Say("Hello"));
  res.send();
});

app.post("/incoming/sms", function(req, res) {
  console.log("incoming sms!");
  res.send("<Response><Sms>Thanks!</Sms></Response>");
});

app.get("/incoming/sms", function(req, res){
	res.send("<Response><Sms>Thanks!</Sms></Response>");
});

app.listen(process.env.PORT || config.port);