exports.config = {
	seleniumAddress: 'http://localhost:4444/wd/hub',
	baseUrl: 'http://demo.gbif.org',
	allScriptsTimeout: 30000,
	specs: ['e2e/test2.spec.js']
};