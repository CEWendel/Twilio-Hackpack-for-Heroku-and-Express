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
	var account_sid = process.env.TWILIO_ACCOUNT_SID;
	var auth_token = process.env.TWILIO_AUTH_TOKEN;
	var app_sid = process.env.TWILIO_APP_SID;
	var phone_number = process.env.TWILIO_CALLER_ID;
	var voice_url = '/voice';
	var sms_url = '/sms';
	var host_; 
	var client;

	this.start = function(){
		console.info('Configuring your Twilio hackpack...');
		console.info('Checking if your credentials are set...');
		if(!account_sid){
			throw new Error("ACCOUNT_SID is not set");
		}
		if(!auth_token){
			throw new Error("AUTH_TOKEN is not set");
		}

		console.log('Checking for host name...');
		if(!host_){
			console.log('Setting hostname...');
			host_ = this.getHerokuHostName();
			console.log('Hostname is now ' + host_);
		}

		console.log('Creating Twilio client...');
		TwilioClient = require('heroku-twilio').Client;
		
		try{
			client = new TwilioClient(account_sid, auth_token, host_);
		}catch(e){
			throw new Error('Could not create Twilio Rest Client, exception: ' + e);
		}

		// If 'http://' isn't found in the voice_url, append the voice_url to the host name
		if(voice_url.indexOf('http://') == -1 ){
			voice_url = host_ + voice_url;
			console.info('Voice url is now ' + voice_url);
		}
		// If 'http://' isn't found in the sms_url, append the sms_url to the host name
		if(sms_url.indexOf('http://') == -1){
			sms_url = host_ + sms_url;
			console.info('Sms url is now ' + sms_url);
		}
		
		var self = this;
		this.configureCallerId(function(number){
			phone_number = number.phone_number;
			
			if(!phone_number){
				throw new Error('There was a problem getting the Caller_Id');
			}

			self.configureApp(function(app){
				app_sid = app.sid;

				if(!app_sid){
					throw new Error('There was a probem setting up the app')
				}

				self.printOutLocalEnvironmentVariableCommands();
				self.setHerokuEnvironmentVariables(function(){
					console.log('done adding heroku env variables');
				});

				//console.log('The hackpack is now configured! Open up your heroku app and then Call ' + phone_number + 
				//	' to Test!' + '\n Go hack away on app.js!');
				//process.exit();
			});
		});
	};	

	this.printOutLocalEnvironmentVariableCommands = function(){
		console.log('Please copy and paste these into your shell to test locally: \n' + 
					'export TWILIO_ACCOUNT_SID=' + process.env.TWILIO_ACCOUNT_SID + '\n' + 
					'export TWILIO_AUTH_TOKEN=' + process.env.TWILIO_AUTH_TOKEN + '\n' +
					'export TWILIO_APP_SID=' + app_sid + '\n' +
					'export TWILIO_CALLER_ID=' + phone_number + '\n');
	};

	this.setHerokuEnvironmentVariables = function(callback){
		/*
		exec('heroku config:add TWILIO_ACCOUNT_SID=' + process.env.TWILIO_ACCOUNT_SID,
			function (error, stdout, stderr){
				console.log(stdout);
		});
		exec('heroku config:add TWILIO_AUTH_TOKEN' + process.env.TWILIO_AUTH_TOKEN,
			function(error, stdout, stderr){
				console.log(stdout);
		});
	*/
		exec('heroku config:add TWILIO_ACCOUNT_SID=' + process.env.TWILIO_ACCOUNT_SID + 
			'TWILIO_AUTH_TOKEN=' + process.env.TWILIO_AUTH_TOKEN +
			'TWILIO_CALLER_ID=' + phone_number +
			'TWILIO_APP_SID=' + app_sid, function(error, stdout, stderr){
				callback();
		});
	};

	this.purchasePhoneNumber = function(purchasedCallback){
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

		askToBuyPhoneNumber('Your Caller_Id is not configured. Buy a new phone number? (Your account will be charged $1) [y/n]', 
			function(output){
			if(output=='y'){
				params = {
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
	};

	this.configureCallerId = function(callback){
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
	};

	this.retrievePhoneNumber = function(number, callback){
		var number;
		try{
			params = {
				PhoneNumber : number
			}
			client.getIncomingNumbers(params, function(body){
				number = body.incoming_phone_numbers[0];
				callback(number);
			});
		}catch (e) {
			throw new Error('Could not retrieve incoming numbers for account. Exception: ' + e);
		}	
	};

	this.createNewTwimlApp = function(createdCallback){
		console.log('Asking user to create new app sid...');
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
		askToCreateTwimlApp('Your APP_SID is not configured. Create a new one? [y/n]', function(output){
			if(output=='y'){
				console.log('Creating new application...');
				params = {
					FriendlyName: 'Hackpack for Heroku and Express',
					VoiceUrl: voice_url,
					SmsUrl: sms_url
				}
				try{
					client.createApplication(params, function(data){
						console.log('Created the application');
						createdCallback(data);
					});
				}catch(e){
					throw new Error('Could not create the application. Exception: ' + e);
				}
			}else{
				throw new Error('Your APP_SID must be configured');
			}
		});
	};

	this.configureApp = function(callback){
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
	};

	this.setAppRequestUrls = function(appSid, callback){
		try{
			params = {
				VoiceUrl: voice_url,
				SmsUrl: sms_url,
				FriendlyName: 'Hackpack for Heroku and Express'
			}
			client.updateApplication(appSid, params, function(body){
				callback(body);
			});
		} catch (e) {
			throw new Error('Could not update application');
		}
	};

	this.getHerokuHostName = function(){
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
	};

	this.setAccountSid = function(accSid){
		account_sid = accSid;
		process.env.TWILIO_ACCOUNT_SID = account_sid;
	};

	this.setAuthToken = function(auth){
		auth_token = auth;
		process.env.TWILIO_AUTH_TOKEN = auth_token;
	};

	this.setAppSid = function(appSid){
		app_sid = appSid
		process.env.TWILIO_APP_SID= app_sid;
	};

	this.setPhoneNumber = function(callerId){
		console.log('setPhoneNumber called'+ callerId);
		phone_number = callerId;
		process.env.TWILIO_CALLER_ID = phone_number;
	};

	this.setVoiceUrl = function(voiceUrl){
		voice_url = voiceUrl;
	};

	this.setSmsUrl = function(smsUrl){
		sms_url = smsUrl;
	};

	this.setDomain = function(domain){
		host_ = domain;
	}
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
