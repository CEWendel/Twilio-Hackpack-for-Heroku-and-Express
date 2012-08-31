var program = require('commander');
var fs = require('fs');
var exec = require('child_process').exec;

program
  .version('Twilio Hackpack for Heorku and Express v0.1')
  .option('-n, --new', 'We need to set up a new AppSID and Number')
  .option('-a, --app_sid [appSid]', 'Use this Twilio App SID')
  .option('-c, --caller_id [callerID]', 'Use this Twilio Number')
  .option('-d, --domain [url]', 'Use this custom domain')
  .option('-as, --account_sid [accSid]', 'Use this Twilio Account SID')
  .option('-at, --auth_token [auth]', 'Use this Twilio Auth Token')
  .option('-v, --voice [url]', 'Use this Voice Url')
  .option('-s, --sms [url]', 'Use this SMS Url')
  .option('-f, --friendly [name]', 'Use this friendly name [HackPack for Heroku and Express]', 
  	'Hackpack for Heroku and Express')
  .parse(process.argv);

function Configure(){
	if(!(this instanceof Configure)) {
		return new Configure();
	}
	this.account_sid = process.env.TWILIO_ACCOUNT_SID;
	this.auth_token = process.env.TWILIO_AUTH_TOKEN;
	this.app_sid = process.env.TWILIO_APP_SID;
	this.phone_number = process.env.TWILIO_CALLER_ID;
	this.voice_url = '/autoprovision/1';
	this.sms_url = '/autoprovision/0';
	this.client_voice_url = '/voice';
	this.host_; 
	this.client;
}

Configure.prototype.start = function() {
	console.info('Configuring your Twilio hackpack...');
	console.info('Checking if your credentials are set...');
	
	if(!this.account_sid){
		throw new Error("ACCOUNT_SID is not set");
	}
	if(!this.auth_token){
		throw new Error("AUTH_TOKEN is not set");
	}

	console.log('Checking for host name...');
	if(!this.host_){
		console.log('Setting hostname...');
		this.host_ = this.getHerokuHostName();
		console.log('Hostname is now ' + this.host_);
	}
	
	console.log('Creating Twilio client...');
	TwilioClient = require('heroku-twilio').Client;
		
	try{
		this.client = new TwilioClient(this.account_sid, this.auth_token, this.host_);
	}catch(e){
		throw new Error('Could not create Twilio Rest Client, exception: ' + e);
	}

	// If 'http://' isn't found in the voice_url, append the voice_url to the host name
	if(this.voice_url.indexOf('http://') == -1 ){
		this.voice_url = this.host_ + this.voice_url;
		console.info('Voice url is now ' + this.voice_url);
	}
	// If 'http://' isn't found in the sms_url, append the sms_url to the host name
	if(this.sms_url.indexOf('http://') == -1){
		this.sms_url = this.host_ + this.sms_url;
		console.info('Sms url is now ' + this.sms_url);
	}

	// If 'http://' isn't found in the client voice url, append the client_voice_url to the host name
	if(this.client_voice_url.indexOf('http://') == -1){
		this.client_voice_url = this.host_ + this.client_voice_url;
		console.info('Client voice url is now ' + this.client_voice_url);
	}
		
	var self = this;
	this.configureCallerId(function(number){
		self.phone_number = number.phone_number;
			
		if(!self.phone_number){
			throw new Error('There was a problem getting the Caller_Id');
		}

		self.configureApp(function(app){
		self.app_sid = app.sid;

			if(!self.app_sid){
				throw new Error('There was a probem setting up the app')
			}

			self.printOutLocalEnvironmentVariableCommands();
			self.setHerokuEnvironmentVariables(function(stdout){
				console.log(stdout + '\n');
				console.log('Your hackpack is almost configured! Open up your Heorku app (heroku open)' +
				'to configure your Voice and Sms urls and then hack away on app.js!');
				process.exit();
			});
		});
	});
}

Configure.prototype.printOutLocalEnvironmentVariableCommands = function(){
	this.host_ = this.host_.replace('http://', '');
	console.log('Please copy and paste these into your shell to test locally: \n' + 
		'export TWILIO_ACCOUNT_SID=' + process.env.TWILIO_ACCOUNT_SID + '\n' + 
		'export TWILIO_AUTH_TOKEN=' + process.env.TWILIO_AUTH_TOKEN + '\n' +
		'export TWILIO_APP_SID=' + this.app_sid + '\n' +
		'export TWILIO_CALLER_ID=' + this.phone_number + '\n' +
		'export TWILIO_HOST=' + this.host_ + '\n');
}

Configure.prototype.setHerokuEnvironmentVariables = function(callback){
	this.host_ = this.host_.replace('http://', '');
	exec('heroku config:add TWILIO_ACCOUNT_SID=' + process.env.TWILIO_ACCOUNT_SID + 
		' TWILIO_AUTH_TOKEN=' + process.env.TWILIO_AUTH_TOKEN +
		' TWILIO_CALLER_ID=' + this.phone_number +
		' TWILIO_APP_SID=' + this.app_sid +
		' TWILIO_HOST=' + this.host_ , function(error, stdout, stderr){
			if(stderr){
				throw new Error('Could not add environment variables to Heroku: ' + stderr)
			} else{
				callback(stdout)
			}
	});
}

Configure.prototype.purchasePhoneNumber = function(purchasedCallback){
	var client = this.client;
	var number;
	var i = 0;
	
	function askToBuyPhoneNumber(question, callback){
		i++;
		process.stdin.resume();
		process.stdin.setEncoding('utf8');
		console.log(question);
		program.prompt('choice: ', function(choice){
			var output = choice.toLowerCase();
			if(output=='y'){
				callback('y');
			}else if(output=='n' || i >= 3){
				callback('n');
			}else{
				askToBuyPhoneNumber(question, callback);
			}
		});
	}

	var self = this;
	askToBuyPhoneNumber('Your Caller_Id is not configured. Buy a new phone number? (Your account will be charged $1) [y/n]', 
		function(output){
		if(output=='y'){
			params = {
				VoiceUrl: self.voice_url,
				SmsUrl: self.sms_url,
				AreaCode: '703'
			}
			try{
				client.purchaseIncomingNumber(params, function(body){
					number = body;
					purchasedCallback(number);
				});
			}catch(e){
				throw new Error('Purchasing incoming number failed. Exception: ' + e);
			}
		}else{
			console.log('A Caller_Id must be specified');
			process.exit();
		}
	});
}

Configure.prototype.configureCallerId = function(callback){
	var phone_number = this.phone_number;
	if(!phone_number){
		this.purchasePhoneNumber(function(number){
			if(number){
				phone_number = number.phone_number;
				callback(number);
			}else{
				throw new Error('A phone number could not be retrieved. Are you sure you have a caller_id?');
			}
		});
	}else{
		this.retrievePhoneNumber(phone_number, function(number){
			if(number){
				phone_number = number.phone_number;			
				callback(number);
			}else{
				throw new Error('A phone number could not be retrieved. Are you sure you have a caller_id?');
			}
		});
	}
}

Configure.prototype.retrievePhoneNumber = function(number, callback){
	var number;
	try{
		params = {
			PhoneNumber: number
		}
		this.client.getIncomingNumbers(params, function(body){
			number = body.incoming_phone_numbers[0];
			callback(number);
		});
	}catch (e) {
		throw new Error('Could not retrieve incoming numbers for account. Exception: ' + e);
	}	
}

Configure.prototype.createNewTwimlApp = function(createdCallback){
	console.log('Asking user to create new app sid...');
	var client = this.client;
	var i = 0;
	var app;
	function askToCreateTwimlApp(question, callback){
		i++;
		process.stdin.resume();
		process.stdin.setEncoding('utf8');
		console.log(question);
		program.prompt('choice: ', function(choice){
			var output = choice.toLowerCase();
			if(output=='y'){
				callback(output);
			}else if(output=='n' || i >= 3){
				callback('n')
			}else{
				ask(question, callback);
			}
		});
	}

	var self = this;
	askToCreateTwimlApp('Your APP_SID is not configured. Create a new one? [y/n]', function(output){
		if(output=='y'){
			console.log('Creating new application...');
			params = {
				FriendlyName: 'Hackpack for Heroku and Express',
				VoiceUrl: self.client_voice_url
			}
			try{
				client.createApplication(params, function(data){
					createdCallback(data);
				});
			}catch(e){
				throw new Error('Could not create the application. Exception: ' + e);
			}
		}else{
			throw new Error('Your APP_SID must be configured');
		}
	});
}

Configure.prototype.configureApp = function(callback){
	var app_sid = this.app_sid;
	if(!app_sid){
		console.log('Creating new TwiML app...');
		this.createNewTwimlApp(function(app){
			if(app){
				app_sid = app.sid;
				callback(app);
			}else{
				throw new Error('Failed creating a new TwiML app');
			}
		});
	}else{
		this.setAppRequestUrls(app_sid, function(app){
			if(app){
				app_sid = app.sid;
				callback(app)
			}else{
				throw new Error('Failed updating app urls');
			}
		});
	}
}

Configure.prototype.setAppRequestUrls = function(appSid, callback){
	try{
		params = {
			VoiceUrl: this.voice_url,
			SmsUrl: this.sms_url,
			FriendlyName: 'Hackpack for Heroku and Express'
		}
		this.client.updateApplication(appSid, params, function(body){
			callback(body);
		});
	} catch (e) {
		throw new Error('Could not update application');
	}
}

Configure.prototype.getHerokuHostName = function(){
	var subdomain;

	// Try to read the git config file.
	try{
		var array = fs.readFileSync('./.git/config').toString().split('\n');
	} catch (e) {
		throw new Error('Could not read ./.git/config file, does it still exist? Failed path: ' + e);
	}
	for(line in array){
		if(array[line].indexOf('git@heroku.com') != -1){
			var splitString = array[line].split(':');
			subdomain = splitString[1].replace('.git', '');
			console.info('Heroku remote found: '+ subdomain);
		}
	}

	// Return Heroku host name.
	if(subdomain){
		var host = 'http://' + subdomain + '.herokuapp.com'
		console.info('Full host is ' + host);
		return host;
	}else{
		throw new Error('Could not find Heroku remote in ./.git/config. Have you created the Heroku app?');
	}
}

Configure.prototype.setAccountSid = function(accSid){
	this.account_sid = accSid;
	process.env.TWILIO_ACCOUNT_SID = this.account_sid;
}

Configure.prototype.setAuthToken = function(auth){
	this.auth_token = auth;
	process.env.TWILIO_AUTH_TOKEN = this.auth_token;
}

Configure.prototype.setAppSid = function(appSid){
	this.app_sid = appSid
	process.env.TWILIO_APP_SID = this.app_sid;
}

Configure.prototype.setPhoneNumber = function(callerId){
	this.phone_number = callerId;
	process.env.TWILIO_CALLER_ID = this.phone_number;
}

Configure.prototype.setVoiceUrl = function(voiceUrl){
	this.voice_url = voiceUrl;
}

Configure.prototype.setSmsUrl = function(smsUrl){
	this.sms_url = smsUrl;
}

Configure.prototype.setDomain = function(domain){
	this.host_ = domain;
}

var configure = new Configure();

if(program.account_sid){
	configure.setAccountSid(program.account_sid);
}

if(program.auth_token){
	configure.setAuthToken(program.auth_token);
}

if(program.app_sid){ 
	configure.setAppSid(program.app_sid);
}

if(program.caller_id){ 
	configure.setPhoneNumber(program.caller_id);
}

if(program.voice){
	configure.setVoiceUrl(program.voice);
}

if(program.sms){
	configure.setSmsUrl(program.sms);
}

if(program.domain){
	configure.setDomain(program.domain);
}

configure.start();
