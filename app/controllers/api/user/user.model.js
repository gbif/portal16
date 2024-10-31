'use strict';

let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    chai = require('chai'),
    expect = chai.expect,
    querystring = require('querystring'),
    request = rootRequire('app/helpers/request'),
    _ = require('lodash'),
    authOperations = require('../../auth/gbifAuthRequest');

module.exports = {
    create: create,
    confirm: confirm,
    login: login,
    getByUserName: getByUserName,
    find: find,
    update: update,
    resetPassword: resetPassword,
    updateForgottenPassword: updateForgottenPassword,
    isValidChallenge: isValidChallenge,
    isValidChallengeEmail: isValidChallengeEmail,
    getClientUser: getClientUser,
    sanitizeUpdatedUser: sanitizeUpdatedUser,
    getDownloads: getDownloads,
    createSimpleDownload: createSimpleDownload,
    createPredicateDownload: createPredicateDownload,
    createSqlDownload: createSqlDownload,
    changePassword: changePassword,
    cancelDownload: cancelDownload,
    changeEmail: changeEmail
};

async function create(body) {
    let options = {
        method: 'POST',
        body: body,
        url: apiConfig.userCreate.url,
        canonicalPath: apiConfig.userCreate.canonical
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== 201) {
        throw response;
    }

    return response.body;
}

async function confirm(challengeCode, userName) {
    let options = {
        method: 'POST',
        body: {
            confirmationKey: challengeCode
        },
        url: apiConfig.userConfirm.url,
        canonicalPath: apiConfig.userConfirm.canonical,
        userName: userName
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== 201) {
        throw response;
    }
    return response.body;
}

async function changeEmail(body) {
    let options = {
        method: 'PUT',
        body: {
            challengeCode: body.challengeCode,
            email: body.email
        },
        url: apiConfig.userChangeEmail.url,
        canonicalPath: apiConfig.userChangeEmail.canonical,
        userName: body.userName
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== 204) {
        throw response;
    }
    return response.body;
}

async function update(userName, body) {
    let options = {
        method: 'PUT',
        body: body,
        url: apiConfig.userAdmin.url + userName,
        canonicalPath: apiConfig.userAdmin.canonical + userName
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode > 299) {
        throw response;
    }
    return response;
}

async function resetPassword(userNameOrEmail) {
    let options = {
        method: 'POST',
        body: {},
        url: apiConfig.userResetPassword.url,
        canonicalPath: apiConfig.userResetPassword.canonical,
        userName: userNameOrEmail
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode > 299) {
        throw response;
    }
    return response.body;
}


async function updateForgottenPassword(body) {
    let challengeCode = body.challengeCode,
        password = body.password;
    // TODO test challengeCode and password is present

    let options = {
        method: 'POST',
        body: {
            challengeCode: challengeCode,
            password: password
        },
        url: apiConfig.userUpdateForgottenPassword.url,
        canonicalPath: apiConfig.userUpdateForgottenPassword.canonical,
        userName: body.userName
    };
    let response = await authOperations.authenticatedRequest(options);

    if (response.statusCode !== 201) {
        throw response;
    }
    return response.body;
}

async function isValidChallenge(userName, challengeCode) {
    let options = {
        method: 'GET',
        url: apiConfig.userChallengeCodeValid.url + '?confirmationKey=' + challengeCode,
        userName: userName
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== 204) {
        throw response;
    }
    return response;
}

async function isValidChallengeEmail(userName, email, challengeCode) {
    let options = {
        method: 'GET',
        url: apiConfig.userChallengeCodeValid.url + '?confirmationKey=' + challengeCode
            + '&email=' + encodeURIComponent(email),
        userName: userName
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== 204) {
        throw response;
    }
    return response;
}

async function getByUserName(userName) {
    let options = {
        method: 'GET',
        url: apiConfig.userAdmin.url + userName
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

async function find(query) {
    let options = {
        method: 'GET',
        url: apiConfig.userFind.url + '?' + querystring.stringify(query)
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

async function getDownloads(userName, query) {
    query = query || {};
    expect(userName, 'user name').to.be.a('string');
    expect(query, 'download query').to.be.an('object');
    let options = {
        url: apiConfig.occurrenceDownloadUser.url + userName + '?' + querystring.stringify(query),
        userName: userName,
        method: 'GET'
    };

    let response = await authOperations.authenticatedRequest(options);
    // this should never be unauthorized, but it happens when the a user is created but not known by the occurrence api (mixed environments)
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

async function createSimpleDownload(user, query) {
    query = query || {};
    expect(query, 'download query').to.be.an('object');
    expect(user.userName, 'user name').to.be.a('string');

    query.notification_address = user.email || 'an_email_is_required_despite_not_needing_it';

    let options = {
        url: apiConfig.occurrenceSearchDownload.url + '?' + querystring.stringify(query),
        userName: user.userName,
        type: 'PLAIN',
        method: 'GET',
        json: false
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

async function createPredicateDownload(user, query, source) {
  query = query || {};
  expect(query, 'download query').to.be.an('object');
  expect(user.userName, 'user name').to.be.a('string');

  let email = user.email;

  let url = apiConfig.occurrenceSearchDownload.url;
  if (source) {
    url += '?source=' + encodeURIComponent(source);
  }
  let options = {
      url: url,
      canonicalPath: apiConfig.occurrenceSearchDownload.canonical,
      body: {
          creator: user.userName,
          notificationAddresses: email ? [email] : undefined,
          sendNotification: true,
          format: query.format || 'SIMPLE_CSV',
          predicate: query.predicate
      },
      userName: user.userName,
      method: 'POST'
  };
  let response = await authOperations.authenticatedRequest(options);
  if (response.statusCode !== 201) {
      throw response;
  }
  return response.body;
}

async function createSqlDownload(user, query, source) {
    query = query || {};
    expect(query, 'download query').to.be.an('object');
    expect(user.userName, 'user name').to.be.a('string');
  
    let email = user.email;
  
    let url = apiConfig.occurrenceSearchDownload.url;
    if (source) {
      url += '?source=' + encodeURIComponent(source);
    }
    let options = {
        url: url,
        canonicalPath: apiConfig.occurrenceSearchDownload.canonical,
        body: {
            creator: user.userName,
            notificationAddresses: email ? [email] : undefined,
            sendNotification: true,
            format: query.format || 'SQL_TSV_ZIP',
            sql: query.sql
        },
        userName: user.userName,
        method: 'POST'
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== 201) {
        throw response;
    }
    return response.body;
  }

async function cancelDownload(user, key) {
    expect(key, 'download query').to.be.a('string');
    expect(user.userName, 'user name').to.be.a('string');

    let options = {
        url: apiConfig.occurrenceCancelDownload.url + key,
        userName: user.userName,
        method: 'DELETE'
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

async function login(auth) {
    let loginRequest = {
        url: apiConfig.userLogin.url,
        method: 'GET',
        headers: {
            authorization: auth
        },
        fullResponse: true,
        json: true
    };
    let response = await request(loginRequest);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

async function changePassword(auth, newPassword) {
    let options = {
        url: apiConfig.userChangePassword.url,
        method: 'PUT',
        headers: {
            authorization: auth
        },
        body: {
            password: newPassword
        },
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 204) {
        throw response;
    }
    return response.body;
}

function getClientUser(user) {
    // sanitize user somehow? iThere isn't anything in the response that cannot go out at this point. later perhaps some configurations that are for internal only
    return {
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: user.roles,
        settings: {
            country: user.settings.country,
            locale: user.settings.locale,
            has_read_gdpr_terms: user.settings.has_read_gdpr_terms
        },
        connectedAcounts: {
            google: _.has(user, 'systemSettings["auth.google.id"]'),
            github: _.has(user, 'systemSettings["auth.github.id"]'),
            orcid: _.has(user, 'systemSettings["auth.orcid.id"]')
        },
        photo: _.get(user, 'systemSettings["auth.google.photo"]') || _.get(user, 'systemSettings["auth.github.photo"]'),
        githubUserName: _.get(user, 'systemSettings["auth.github.username"]'),
        orcid: _.get(user, 'systemSettings["auth.orcid.id"]')
    };
}

function sanitizeUpdatedUser(user) {
    return {
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        settings: {
            country: user.settings.country,
            locale: user.settings.locale,
            has_read_gdpr_terms: user.settings.has_read_gdpr_terms
        }
    };
}
