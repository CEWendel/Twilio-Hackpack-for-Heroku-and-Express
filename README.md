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

#Usage:

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