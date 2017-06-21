//used by the live www portal to create a signpost redirecting users to the demo site to get feedback before release.
//it is hosted here so that we do not have to release a new version of the live portal to update signposts as more pages are ready for redirection

var queryString = require('query-string');
var decamelize = require('decamelize');
var path = require('path');

function www2demoQuery(query) {
    if (!query) {
        return '';
    }
    var parsed = queryString.parse(query);
    var transformedQuery = {};
    for (var key in parsed) {
        if (Object.prototype.hasOwnProperty.call(parsed, key)) {
            var transformKey = decamelize(key);
            transformedQuery[transformKey] = parsed[key];
        }
    }
    return '?' + queryString.stringify(transformedQuery);
}

var redirectedPages = [
    {
        pattern: /^\/occurrence\/[0-9]+$/gi
    },
    {
        pattern: /^\/occurrence\/search/gi
    },
    {
        pattern: /^\/dataset\/search/gi
    },
    {
        pattern: /^\/publisher\/search/gi
    },
    {
        pattern: /^\/species\/search/gi
    },
    {
        pattern: /^\/dataset\/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/i
    },
    {
        pattern: /^\/publisher\/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/i
    },
    {
        pattern: /^\/species\/[0-9]+$/gi
    }
];


function isRedirectedPage(path) {
    for (var i = 0; i < redirectedPages.length; i++) {
        var regexPattern = redirectedPages[i].pattern;
        if (regexPattern.test(path)) {
            return true;
        }
    }
    return false;
}

function www2demo() {
    var locationPath = location.pathname;
    var locationQuery = location.search;

    var mappedQuery = www2demoQuery(locationQuery);
    var mappedPath = locationPath;

    return path.join('https://demo.gbif.org/', mappedPath) + mappedQuery;
}

function addWwwSignPost() {
    var link = www2demo();
    var divStyle = 'z-index: 10000;' +
        'position: fixed;' +
        'bottom: 0;' +
        'width: 100%;' +
        'padding: 10px 5px;' +
        'background: #58a04c;' +
        'color: white;' +
        'text-align: center;' +
        'box-shadow: 0 -1px 1px 2px rgba(0,0,0,0.2);';

    var linkStyle = 'padding: 7px 10px;' +
        'background: #ffffff;' +
        'display: inline-block;' +
        'color: #58a04c;' +
        'text-transform: uppercase;' +
        'font-size: 12px;' +
        'border-radius: 2px;' +
        'font-weight: 500;';

    var elemDiv = document.createElement('div');
    elemDiv.style.cssText = divStyle;
    var aTag = document.createElement('a');
    aTag.style.cssText = linkStyle;
    aTag.setAttribute('href', link);
    aTag.innerHTML = "We’re working on a redesign of GBIF.org - Try it here";
    elemDiv.appendChild(aTag);
    document.body.appendChild(elemDiv);
}

function addWarning() {
    var divStyle = 'z-index: 10000;' +
        'position: fixed;' +
        'bottom: 0;' +
        'width: 100%;' +
        'padding: 10px 5px;' +
        'background: tomato;' +
        'color: white;' +
        'text-align: center;' +
        'box-shadow: 0 -1px 1px 2px rgba(0,0,0,0.2);';

    var linkStyle = 'padding: 7px 10px;' +
        'background: #ffffff;' +
        'display: inline-block;' +
        'color: tomato;' +
        'text-transform: uppercase;' +
        'font-size: 12px;' +
        'border-radius: 2px;' +
        'font-weight: 500;';

    var elemDiv = document.createElement('div');
    elemDiv.style.cssText = divStyle;
    var aTag = document.createElement('a');
    aTag.style.cssText = linkStyle;
    aTag.setAttribute('href', 'http://www.gbif.org/newsroom/news/83329/trinidad-workshops-kick-off-bid-caribbean');
    aTag.innerHTML = "We’re moving our servers. That means that not all part of the site is functional. Read more ...";
    elemDiv.appendChild(aTag);
    document.body.appendChild(elemDiv);

    var footer = document.getElementById('footer-credits');
    footer.style.paddingBottom = '50px'
}


// if (isRedirectedPage(location.pathname)) {
//     addWwwSignPost();
// }

var _notifications = {$ notifications | rawJson | safe $}
if (_notifications.count > 0) {
    addWarning();
} else {
    window.timeout(function(){
        if (_notifications.count > 0) {
            addWarning();
        }
    }, 1500)
}