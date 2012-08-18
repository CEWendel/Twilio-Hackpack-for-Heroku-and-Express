var program = require('commander');
var fs = require('fs');
var exec = require('child_process').exec;

program
  .version('Twilio Hackpack for Heorku and Express v0.1')
  .option('-n, --new', 'We need to set up a new AppSID and Number')
  .option('-a, --app [appSid]', 'Use this Twilio App SID')
  .option('-c, --caller', 'Use this Twilio Number')
  //.option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
  .option('-d, --domain [url]', 'Use this custom domain')
  .option('-as, --account_sid [accSid]', 'Use this Twilio Account SID')
  .option('-at, --auth_token [auth]', 'Use this Twilio Auth Token')
  .option('-v, --voice [url]', 'Use this Voice Url')
  .option('-s, --sms [url]', 'Use this SMS Url')
  .option('-f, --friendly [name]', 'Use this friendly name [HackPack for Heroku and Express]', 
  	'HackPack for Heroku and Express')
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
		console.log('Configuring your Twilio hackpack...');
		console.info('Checking if your credentials are set...');
		if(typeof account_sid === 'undefined'){
			console.error("ACCOUNT_SID is not set");
			process.exit();
		}
		if(typeof auth_token === 'undefined'){
			console.error("AUTH_TOKEN is not set");
			process.exit();
		}

		console.log('Checking for host name...');
		if(typeof host_ === 'undefined'){
			console.log('Setting hostname...');
			host_ = this.getHerokuHostName();
			console.log('Hostname is now ' + host_);
		}

		console.log('Creating Twilio client...');
		TwilioClient = require('node-twilio').Client;
		
		client = new TwilioClient(account_sid, auth_token, host_);

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
				console.error('There was a problem getting the Caller_Id');
				process.exit();
			}

			self.configureApp(function(app){
				app_sid = app.sid;

				if(!app_sid){
					console.error('There was a probem setting up the app')
					process.exit();
				}

				self.printOutLocalEnvironmentVariableCommands();
				self.setHerokuEnvironmentVariables();

				console.log('The hackpack is now configured! Call ' + phone_number + ' to Test!' +
					'\n Go hack away on app.js!');
				process.exit();
			});
		});
	};	

	this.printOutLocalEnvironmentVariableCommands = function(){
		console.log('Please copy and paste these into your shell to test locally: \n' + 
					'export TWILIO_ACCOUNT_SID= '+ process.env.TWILIO_ACCOUNT_SID + '\n' + 
					'export TWILIO_AUTH_TOKEN=' + process.env.TWILIO_AUTH_TOKEN + '\n' +
					'export TWILIO_APP_SID=' + app_sid + '\n' +
					'export TWILIO_CALLER_ID=' + phone_number + '\n');
	};

	this.setHerokuEnvironmentVariables = function(){
		exec('heroku config:add TWILIO_ACCOUNT_SID=' + process.env.TWILIO_ACCOUNT_SID + 
			'TWILIO_AUTH_TOKEN=' + process.env.TWILIO_AUTH_TOKEN +
			'TWILIO_CALLER_ID=' + phone_number +
			'TWILIO_APP_SID=' + app_sid );
	};

	this.purchasePhoneNumber = function(purchasedCallback){
		console.log('Purchase Phone number called');
		var number;
		var i = 0;
		
		function askToBuyPhoneNumber(question, callback){
			i++;
			process.stdin.resume();
			process.stdin.setEncoding('utf8');
			console.log(question);
			program.prompt('choice: ', function(choice){
				var output = choice.toLowerCase();
				console.log('output was: ' + output);
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
					AreaCode: '703',
					VoiceUrl: voice_url,
					SmsUrl: sms_url
				}
				client.purchaseIncomingNumber(params, function(body){
					number = body;
					purchasedCallback(number);
				});
			}else{
				console.log('A Caller_Id must be specified');
				process.exit();
			}
		});
	};

	this.configureCallerId = function(callback){
		if(!phone_number){
			this.purchasePhoneNumber(function(number){
				phone_number = number.phone_number;
				callback(number);
			});
		}else{
			this.retrievePhoneNumber(phone_number, function(number){
				phone_number = number.phone_number;
				callback(number);
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
			console.error('Could not retrieve phone number');
			process.exit();
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
				client.createApplication(params, function(data){
					console.log('Created the application');
					createdCallback(data);
				});
			}else{
				console.error('Your APP_SID must be configured');
				process.exit();
			}
		});
	};

	this.configureApp = function(callback){
		if(!app_sid){
			console.log('Creating new TwiML app...');
			this.createNewTwimlApp(function(app){
				app_sid = app.sid;
				callback(app);
			});
		}else{
			this.setAppRequestUrls(app_sid, function(app){
				app_sid = app.sid;
				callback(app)
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
			console.error('Could not update application');
			process.exit();
		}
	};

	this.getHerokuHostName = function(){
		var subdomain;

		// Try to read the git config file.
		try{
			var array = fs.readFileSync('./.git/config').toString().split('\n');
		} catch (e) {
			console.error('Could not read ./.git/config file, does it still exist? Failed path: ' + e);
			process.exit();
		}
		for(line in array){
			if(array[line].indexOf('git@heroku.com') != -1){
				var splitString = array[line].split(':');
				subdomain = splitString[1].replace('.git', '');
				console.info('Heroku remote found: '+ subdomain);
			}
		}

		// Return Heroku host name.
		if(typeof subdomain != 'undefined'){
			var host = 'http://' + subdomain + '.herokuapp.com'
			console.info('Full host is ' + host);
			return host;
		}else{
			console.error('Could not find Heroku remote in ./.git/config. Have you created the Heroku app?');
		}
	};

	this.setAccountSid = function(acc_sid){
		account_sid = acc_sid;
		process.env.TWILIO_ACCOUNT_SID = account_sid;
	};

	this.setAuthToken = function(auth){
		auth_token = auth;
		process.env.TWILIO_AUTH_TOKEN = auth_token;
	};
}

var configure = new Configure();

if(typeof program.account_sid != 'undefined'){
	configure.setAccountSid(program.account_sid);
}

if(typeof program.auth_token != 'undefined'){
	configure.setAuthToken(program.auth_token);
}

configure.start();






