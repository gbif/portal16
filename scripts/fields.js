let request = require("requestretry");
let _ = require("lodash");

let url = "http://api.gbif.org/v1/grbio/person?limit=4000";

async function getData() {
		let response = await request.get(url, {json: true});
		let body = response.body;
		//console.log(body);
    let result = {};
    body.results.forEach(x => {
			//if (x.disciplines.length > 0) console.log(x.key);
			//result = [...result, ...x.disciplines];
			_.merge(result, x)
    });
    console.log(result);
}

getData();

var a = [
	"URL",
	"LSID",
	"HANDLER",
	"DOI",
	"UUID",
	"FTP",
	"URI",
	"UNKNOWN",
	"GBIF_PORTAL",
	"GBIF_NODE",
	"GBIF_PARTICIPANT",
	"GRBIO_ID",
	"GRBIO_URI"
	]
;
	
	b = {};
	a.forEach(x => {
		b[x] = x.replace(/\_/g, ' ');
	})
	// console.log(JSON.stringify(b, null, 2));