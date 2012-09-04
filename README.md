Twilio-Hackpack-for-Heroku-and-Express
======================================

A Twilio hackpack to get you started fast building Twilio apps on Express with Node. 
Port of [Rob Spectre's Hackpack for Flask](http://github.com/robspectre/Twilio-Hackpack-for-Heroku-and-Flask) and [Oscar Sanchez's Hackpack for Sinatra](http://github.com/labcoder/Twilio-Hackpack-for-Heroku-and-Sinatra).

##Features:
* Heroku Friendly - Uses the [heroku-twilio](http://github.com/cewendel/heroku-twilio) package so your app can successfully make calls on Heroku!
* Make Rest Texts/Calls - Comes ready to send texts and make calls to any phone number.
* Voice/Sms endpoints - Automatically sets up Voice and Sms URL's for your Twilio Caller-Id, and Voice URL for your Twilio App.
* Configuration - Simply run `node configure.js --account_sid ACXXXX --auth_token YYYY`
to easily set up your app and environments
* Easy hacking - Just modify app.js to start building cool Twilio apps immediately 

##Usage:

Endpoints in the Node hackpack don't work exactly like the other hackpacks...so pay attention!
###Endpoints

#### Twilio Application Endpoints (Used for Twilio Client)
Voice endpoint:
```javascript
app.all("/voice", function(req,res){
  var r = new Twiml.Response();
  r.append(new Twiml.Say('Hello! This is your voice endpoint for your Twilio app'));
  res.send(r.toString());
});
```

#### Phone Number Endpoints
The Twilio node helper library handles the Voice and Sms url's for you. All you have to do is setup your 'PhoneNumber' object

```javascript
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
```

###Making Rest Calls and Sending Texts

The hackpack comes with two endpoints that show you how to make a call and send a text using the Twilio node helper library:

####Making Calls
```javascript
app.get("/makeCall", function(req, res) {
	phone.makeCall('+1XXXYYYZZZZ', null, function(call){
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
```

####Sending Sms
```javascript
app.get("/sendSms", function(req, res){
  var number = '+1XXXYYYZZZZ';
  phone.sendSms(number, 'Hello!', null, function(sms){
    res.send('Sent sms to ' + number);
  });
});
```

##Installation:
Step-by-step on how to deploy, configure, and develop using this app

###Getting started
1) Clone this repo
<pre> git clone git@github.com:CEWendel/Twilio-Hackpack-for-Heroku-and-Express.git</pre>

2) Navigate to the directory and create a [Heroku](https://toolbelt.herokuapp.com) Cedar stack:
<pre> heroku create --stack cedar </pre>

3) Deploy to Heroku
<pre> git push heroku master </pre>
Don't open the app until after you configure your Twilio info!

###Configuration
There are a couple ways you can configure your app

####Automatic Configuration
The hackpack comes with a script to configure your Twilio app for you, meaning it purchases a new phone number for you, creates a new app for you, the whole shebang

1) Make sure all dependencies are installed
<pre> npm install </pre>

2) Run configure script
<pre> node configure.js --account_sid ACXXXXXX --auth_token YYYYYY </pre>

3) For local development, copy and paste the commands given to you from the configure script into your shell.
<pre>
export TWILIO_ACCOUNT_SID=ACXXXXXXXXXX
export TWILIO_AUTH_TOKEN=YYYYYYYY
export TWILIO_APP_SID=APZZZZZZZZ
export TWILIO_CALLER_ID=+15556789123
</pre>

4) Open your app
<pre> heroku open </pre>

####Using your own enviroment variables
If you already have a Twilio app and/or phone number you want to use you can set your local environment variables before you run the configure script, and the script will not set new ones up for you

1) Set local enviroment variables
<pre>
export TWILIO_ACCOUNT_SID=ACXXXXXXXXXX
export TWILIO_AUTH_TOKEN=YYYYYYYY
export TWILIO_APP_SID=APZZZZZZZZ
export TWILIO_CALLER_ID=+15556789123
</pre>

2) And then run the configure script
<pre> node configure.js </pre>

3) Open your app
<pre> heroku open </pre>

### Local Development

To run the hackpack locally:

1) Install the dependencies
<pre> npm install </pre>

2) Launch local webserver
<pre> foreman start </pre>

3) Open browser to [localhost:5000](http://localhost:5000)

4) Hack away on app.js

##Questions/Concerns
Email Chris Wendel at <chriwend@umich.edu>

