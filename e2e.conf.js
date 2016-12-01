exports.config = {
	seleniumAddress: 'http://localhost:4444/wd/hub',
	baseUrl: 'http://localhost:7000',
	allScriptsTimeout: 30000,
	specs: ['e2e/test2.spec.js']
};