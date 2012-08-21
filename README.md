Twilio-Hackpack-for-Heroku-and-Express
======================================

A Twilio hackpack to get you started fast building Twilio apps on Express with Node. 
Port of [Rob Spectre's Hackpack for Flask](http://github.com/robspectre/Twilio-Hackpack-for-Heroku-and-Flask) and [Oscar Sanchez's Hackpack for Sinatra](http://github.com/labcoder/Twilio-Hackpack-for-Heroku-and-Sinatra).

##Features:
* Heroku Friendly - Uses the [heroku-twilio](http://github.com/cewendel/heroku-twilio) package so your app can successfully make calls on Heroku!
* Twilio Client - Comes ready to go with [Twilio Client](htt://twilio.com/client)
* Configuration - simply run `node configure.js --account_sid ACxxx --auth_token yyyyy`
to easily set up your app and environments
* Easy hacking - Just modify app.js to start building cool Twilio apps immediately 

##Usage:

Endpoints in the Node hackpack don't work exactly like the other hackpacks...so pay attention!
###Endpoints

#### Application Endpoints (similar to other hackpacks)
Voice endpoint:
```javascript
app.get('/voice', function(req,res){
	var response = twiml.Response();
	response.play('');
	res.send(response);
});
```
Sms endpoint:
```javascript
app.get('/sms', function(req,res){
	var response = twiml.Response();
	response.sms('');
	res.send(response);
});
```

#### Phone Number Endpoints
None.
That's right, the twilio node helper library handles the voice and sms url's for you. All you have to do is setup your 'PhoneNumber' object

```javascript
phone.setup(function(){
	app.listen(config.port, function(){
		return console.log('Listening on ' + config.port);
	});

	phone.on('incomingCall', function(reqParams, response){
		response.append(new Twiml.Say('Hello! This is your voice endpoint!'));
		response.send();
	});
});
```

##Installation:
Step-by-step on how to deploy, configure, and develop using this app

###Getting started
1) Clone this repo
<pre>git clone git://github.com/cewendel/Twilio-Hackpack-for-Heroku-and-Express.git</pre>

2) Navigate to directory and create a [Heroku](https://toolbelt.herokuapp.com) Cedar stack:
<pre> heroku create --stack cedar </pre>

3) Deploy to Heroku
<pre> git push heroku master </pre>

4) Open up your new app:
<pre> heroku open </pre>

###Configuration
There are a couple ways you can configure your app

####Automatic Configuration
The hackpack comes with a script to configure your Twilio app for you, meaning it purchases a new phone number for you, creates a new app for you, the whole shebang

1) Make sure all dependencies are installed
<pre> npm install </pre>

2) Run configure script
<pre> node configure --account_sid ACXXXXXX --auth_token YYYYYY </pre>

3) For local development, copy and paste the commands given to you from the configure script into your shell.
<pre>
export TWILIO_ACCOUNT_SID=ACXXXXXXXXXX
export TWILIO_AUTH_TOKEN=YYYYYYYY
export TWILIO_APP_SID=APZZZZZZZZ
export TWILIO_CALLER_ID=+15556789123
</pre>

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

