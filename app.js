var express = require('express');
var pub = __dirname + '/public';

app = express.createServer();
app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.static(pub));
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
});


config = {};
config.TWILIO_ACCOUNT_SID = 'ACefb267919ab7c793e889ce40b8db2506';
config.TWILIO_AUTH_TOKEN = '6cb0a97591eaf94ca237572fe4472458';
config.HOST = 'twiliohackpacknode.herokuapp.com';
config.port = 5000;
var TwilioClient = require('node-twilio').Client,
  Twiml = require('node-twilio').Twiml,
  client = new TwilioClient(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN , config.HOST, {
    "express" : app
  });

var out = "hello", phone = client.getPhoneNumber('+14157234224');

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

app.get("/sms", function(req,res){
	phone.sendSms("+17033891424", "Hello", {}, function(text){
		res.send("Text sent");
	})
});	

app.post("/incoming/sms", function(req, res) {
  console.log("incoming sms!");
  res.send("<Response><Sms>Thanks!</Sms></Response>");
});

app.get("/incoming/sms", function(req, res){
	res.send("<Response><Sms>Thanks!</Sms></Response>");
});

app.listen(process.env.PORT || config.port);