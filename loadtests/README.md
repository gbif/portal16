# Load test
IT is not yet decided how we should stress test. 

## Artillery.io
One approach could be to use the Node tool Artillery. To use install artillery.io
```
npm install artillery
```

Run individual tests with
```
node node_modules/artillery/bin/artillery run loadtests/singlepage.json --output loadtests/reports/single
```

Generate html report with
```
node node_modules/artillery/bin/artillery report loadtests/reports/single.json
```

## Simple cURL
time curl -s "http://localhost:3000?[1-100]"

## Apache ab
[Apache ab](http://httpd.apache.org/docs/2.2/programs/ab.html)