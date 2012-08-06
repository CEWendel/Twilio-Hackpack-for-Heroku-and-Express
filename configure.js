var program = require('commander');
var fs = require('fs');

program
  .version('Twilio Hackpack for Heorku and Express v0.1')
  .option('-n, --new', 'We need to set up a new AppSID and Number')
  .option('-a, --app [appSid]', 'Use this Twilio App SID')
  .option('-c, --caller', 'Use this Twilio Number')
  //.option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
  .option('-d, --domain [url]', 'Use this custom domain')
  .option('-as, --account_sid [sid]', 'Use this Twilio Account SID')
  .option('-at, --auth_token [auth]', 'Use this Twilio Auth Token')
  .option('-v, --voice [url]', 'Use this Voice Url')
  .option('-s, --sms [url]', 'Use this SMS Url')
  .option('-f, --friendly [name]', 'Use this friendly name [HackPack for Heroku and Express]', 
  	'HackPack for Heroku and Express')
  .parse(process.argv);

console.log('  - friendlyName is %s ', program.friendly);

//function Configure(account_sid, auth_token, app_sid, phone_number,
//voice_url, sms_url, host_){
function Configure(){
	var account_sid = process.env.ACCOUNT_SID;
	var auth_token = process.env.AUTH_TOKEN;
	var app_sid = process.env.APP_SID;
	var phone_number = process.env.CALLER_ID;
	var voice_url = '/voice';
	var sms_url = '/sms';
	var host_ , client;

	this.start = function(){
		console.log('Configuring your Twilio hackpack...');
		console.info('Checking if your credentials are set...');
		if(typeof account_sid === 'undefined'){
			console.error("ACCOUNT_SID is not set");
		}
		if(typeof auth_token === 'undefined'){
			console.error("AUTH_TOKEN is not set");
		}
		console.log('Creating Twilio client...');
		var twilioClient = require('node-twilio').Client;

		console.log('Checking for host name...');
		if(typeof host_ === 'undefined'){
			console.log('Setting hostname...');
			host_ = this.getHerokuHostName();
			console.log('Hostname is now ' + host_);
		}

		console.log('Checking if urls are set');
		// If 'http://' isn't found in the voice_url, append the voice_url to the host name 
		if(voice_url.indexOf('http://') == -1 ){
			voice_url = host_ + voice_url;
			console.info('Voice url is now ' + voice_url);
		}
		// If 'http://' isn't found in the sms_url, append the sms_url to the host name
		if(sms.url.indexOf('http://') == -1){
			sms_url = host_ + sms_url;
			console.info('Sms url is now ' + sms_url);
		}
	};	

	this.configureHackpack = function(){
		
	}

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

	/******************
	Getters and Setters
	*******************/
	this.getAccountSid = function(){
		return account_sid;
	};
}

var configure = new Configure();

console.log('Account sid is ' + configure.getAccountSid());
//console.log('getHerokuHostName is' + configure.getHerokuHostName());
configure.start();






