Twilio-Hackpack-for-Heroku-and-Express
======================================

A Twilio hackpack to get you started fast building Twilio apps on Express with Node. 
Port of [Rob Spectre's Hackpack for Flask](http://github.com/robspectre/Twilio-Hackpack-for-Heroku-and-Flask) and [Oscar Sanchez's Hackpack for Sinatra](http://github.com/labcoder/Twilio-Hackpack-for-Heroku-and-Sinatra).

##Features:
* Heroku Friendly - Uses the [heroku-twilio](http://github.com/cewendel/heroku-twilio) package so your app can successfully make calls! 
* Twilio Client - Comes ready to go with [Twilio Client](htt://twilio.com/client)
* Configuration - simply run `node configure.js --account_sid ACxxx --auth_token yyyyy`
to easily set up your app and environments
* Easy hacking - Just modify app.js to start building cool Twilio apps immediately 

##Usage:

This hackpack comes with two ready-made Express endpoints in app.js:

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

##Installation:
Step-by-step on how to deploy, configure, and develop using this app

###Getting started
1) Clone this repo
<pre>git clone git://github.com/cewendel/Twilio-Hackpack-for-Heroku-and-Express.git</pre>

2) Navigate to directory and create a [Heroku](https://toolbelt.herokuapp.com) Cedar stack:
<pre> heroku create --stack cedar </pre>

3) Configure your app:
* run `npm install` to obtain the required node packages to get up and running
* run the configure script

<pre>node configure.js --account_sid ACXXXXX --auth_token yyyyy</pre>
* for local development, copy and paste the commands the configure script provides to set your local enviroment variables:

<pre>
export TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxx
export TWILIO_AUTH_TOKEN=yyyyyyyyyyyyyyyyy
export TWILIO_APP_SID=APzzzzzzzzzzzzzzzzzz
export TWILIO_CALLER_ID=+15556667777
</pre>
* Launch webserver: `foreman start`

4) Deploy to Heroku:
<pre>git push heroku master</pre>

5) Check it out:
<pre>heroku open</pre>