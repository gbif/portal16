'use strict';

let _ = require('lodash');
let User = require('../api/user/user.model');
let atob = require('atob');
let auth = require('./auth.service');
let crypto = require('crypto');

module.exports = {
    genRandomString: genRandomString,
    validateRegistration: validateRegistration,
    authCallback: authCallback
};

/**
 * generic wrapper for handling callback from auth providers. Will either connect, login or create a new account based on the state included in the initial request
 * @param req
 * @param res
 * @param next
 * @param err
 * @param profile
 * @param info
 * @param setProviderValues
 * @param providerEnum
 * @param identificationKey
 */
function authCallback(req, res, next, err, profile, info, setProviderValues, providerEnum, identificationKey) {
    if (!identificationKey || !providerEnum) {
        throw new Error('Missing provider or id key');
    }
    auth.setNoCache(res);
    if (!err) {
        try {
            // assume that there is always a state associated with the call
            let state = JSON.parse(atob(req.query.state));
            // LOGIN
            if (state.action === 'LOGIN') {
                login(req, res, next, state, profile, providerEnum, identificationKey);
            } else if (state.action === 'CONNECT') {
                connect(req, res, next, state, profile, setProviderValues, providerEnum, identificationKey);
            } else if (state.action === 'REGISTER') {
                // next(new Error('registration not supported as the API does not support the flow yet'));
                register(req, res, next, state, profile, setProviderValues, providerEnum, identificationKey);
            } else {
                next(new Error('Invalid callback state'));
            }
        } catch (err) {
            // something went wrong - probably while trying to parse the base 64 encoded state
            next(err);
        }
    } else {
        next(err);
        return;
    }
}

function getFirstVerifiedEmail(profile) {
    // if not found by provider id, then the user hasn't commected.
    // But we might be able to find the user by email instead.
    let profileEmails = _.get(profile, 'emails', []);
    let profileEmail = _.find(profileEmails, function(email) {
        // Trust the email if:
        // 1) the claim is that it has been verified
        // 2) exception for facebook as they do not expose the verified claim, but does so according to tests and the wisdom of the internet.
        return email.value && (email.verified === true || profile.provider === 'facebook'); // NB special exception for facebook as it has been validated that facebook only expose verified emails
    });
    return profileEmail;
}

class LoginError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LoginError';
        this.statusCode = 204;
    }
}

async function getUserFromProvider(profile, identificationKey) {
    try {
        // check to see if the profile is linked to any users
        let findQuery = {};
        findQuery[identificationKey] = profile.id;
        let user = await User.find(findQuery);
        return user;
    } catch (err) {
        if (err.statusCode == 204) {
            // if not found by provider id, then the user hasn't commected.
            // But we might be able to find the user by email instead.
            let profileEmail = getFirstVerifiedEmail(profile);
            if (!profileEmail) {
                throw new LoginError('No verified email in profile');
            }
            return User.getByUserName(profileEmail.value);
        } else {
            throw err;
        }
    }
}

/**
 * Log in with auth provider
 * @param req
 * @param res
 * @param next
 * @param state
 * @param profile
 */
function login(req, res, next, state, profile, providerEnum, identificationKey) {
    getUserFromProvider(profile, identificationKey)
        .then(function(user) {
            // the user was found - log in
            auth.logUserIn(res, user);
            res.redirect(302, state.target);
        })
        .catch(function(err) {
            if (err.statusCode == 204) {
                // the profile isn't known to us
                // tell the user to login and connect
                res.cookie('loginFlashInfo', JSON.stringify({authProvider: providerEnum, error: 'LOGIN_UNKNOWN'}),
                    {
                        maxAge: 60000, // 1 minute
                        secure: false,
                        httpOnly: false
                    }
                );
                res.redirect(302, '/user/profile');
            } else {
                // something went wrong while searching for the user - this shouldn't happen and is likely an API failure or an app secret error
                // we cannot do anything but show an error message to the user
                next(err);
            }
        });
}

/**
 * Connect logged in user to auth provider
 * @param req
 * @param res
 * @param next
 * @param state
 * @param profile
 */
function connect(req, res, next, state, profile, setProviderValues, providerEnum, identificationKey) {
    // ensure user is logged in before connecting accounts
    if (req.user) {
        // check if the profile is already connected to another account
        let findQuery = {};
        findQuery[identificationKey] = profile.id;
        User.find(findQuery)
            .then(function(user) {
                // the profile is already connected to another user account
                res.cookie('profileFlashInfo', JSON.stringify({authProvider: providerEnum, error: 'PROVIDER_ACCOUNT_ALREADY_IN_USE'}),
                    {
                        maxAge: 60000, // 1 minute
                        secure: false,
                        httpOnly: false
                    }
                );
                res.redirect(302, '/user/profile');
            })
            .catch(function(err) {
                if (err.statusCode == 204) {
                    // the profile isn't in our systems
                    // connect it to the user account
                    setProviderValues(req.user, profile);
                    User.update(req.user.userName, req.user);
                    res.redirect(302, state.target || '/');
                } else {
                    // something went wrong while searching for the user - this shouldn't happen and is likely an API failure or an app secret error
                    // we cannot do anything but show an error message to the user
                    next(err);
                }
            });
    } else {
        next(new Error('user is not logged in while trying to connect accounts'));
    }
}

/**
 * Cehck if the user is eligible for creation and if so create the user with automatic attachment to the profile
 * @param req
 * @param res
 * @param next
 * @param state
 * @param profile
 */
async function register(req, res, next, state, profile, setProviderValues, providerEnum, identificationKey) {
    let regState = await validateRegistration(req.user, state, profile, identificationKey);
    let query = {
        state: 'REGISTER',
        countryCode: state.countryCode,
        userName: state.userName,
        authProvider: providerEnum,
        error: regState.status
    };

    switch (regState.status) {
        case 'USER_ALREADY_LOGGED_IN':
            auth.logUserIn(res, regState.user);
            break;
        case 'PROVIDER_ACCOUNT_ALREADY_IN_USE':
            break;
        case 'EMAIL_IN_USE':
            query.state = 'LOGIN';
            query.userName = regState.user.email;
            break;
        case 'NO_EMAIL_PROVIDED':
            break;
        case 'USERNAME_NOT_UNIQUE':
            break;
        case 'CREATE_ACCOUNT':
            createAccount(req, res, next, state, profile, regState, setProviderValues, identificationKey);
            return;
        case 'FAILED':
            break;
        default:
            res.send(regState.status);
            return;
    }

    res.cookie('loginFlashInfo', JSON.stringify(query),
        {
            maxAge: 60000, // 1 minute
            secure: false,
            httpOnly: false
        }
    );
    res.redirect(302, '/user/profile');
}

/**
 * The profile and username and email is new - create the account and log the user in.
 * @param req
 * @param res
 * @param next
 * @param state
 * @param profile
 * @param regState
 */
function createAccount(req, res, next, state, profile, regState, setProviderValues, identificationKey) {
    let displayName = profile.displayName;
    let firstName;
    let lastName;

    // if no name given then try to guess it from the display name by splitting it in 2
    if (displayName) {
        let firstSpace = displayName.trim().indexOf(' ');
        if (firstSpace > 0) {
            firstName = displayName.substr(0, firstSpace).trim();
            lastName = displayName.substr(firstSpace).trim();
        }
    }
    // Create our user - System settings can not be set at creation time
    let user = {
        userName: state.userName,
        email: regState.email,
        password: genRandomString(40),
        firstName: firstName,
        lastName: lastName,
        settings: {
            country: state.countryCode
        }
    };
    _.set(user, 'systemSettings["' + identificationKey + '"]', profile.id);
    setProviderValues(user, profile);// save values specific to that auth provider
    User.create(user)
        .then(function() {
            // TODO why is the API only returning a fraction of the user on create?
            auth.logUserIn(res, user);// might make better sense to user the returned user from the API, but currently it only returns a fraction of the user object
            res.redirect(302, state.target || '/');
        }).catch(function(err) {
            next(err);
        });
}

async function optionalGetByUserName(userName) {
    try {
        let user = await User.getByUserName(userName);
        return user;
    } catch (err) {
        if (err.statusCode == 204) {
            return;
        } else {
            throw (err);
        }
    }
}

async function optionalFind(query) {
    try {
        let user = await User.find(query);
        return user;
    } catch (err) {
        if (err.statusCode == 204) {
            return;
        } else {
            throw (err);
        }
    }
}

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
function genRandomString(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0, length); /** return required number of characters */
}

async function validateRegistration(loggedInUser, state, profile, identificationKey) {
    if (loggedInUser) {
        return {
            status: 'USER_ALREADY_LOGGED_IN',
            user: loggedInUser
        };
    }
    try {
        // check to see if the user is already registered - if so then just login
        let profileId = _.get(profile, 'id');
        let profileEmails = _.get(profile, 'emails', []);
        let profileEmail = getFirstVerifiedEmail(profile);

        if (!profileEmail) {
            return {
                status: 'NO_EMAIL_PROVIDED'
            };
        }

        let query = {};
        query[identificationKey] = profileId;
        let existingProfile = await optionalFind(query);
        if (existingProfile) {
            return {
                status: 'PROVIDER_ACCOUNT_ALREADY_IN_USE',
                user: existingProfile
            };
        }
        // unknown user from the auth provider

        // check emails
        for (let i = 0; i < profileEmails.length; i++) {
            let email = profileEmails[i];
            let knownEmailUser = await optionalGetByUserName(email.value);
            if (knownEmailUser) {
                return {
                    status: 'EMAIL_IN_USE',
                    user: knownEmailUser
                };
            }
        }
        // no users registered with the email returned by the auth provider
        // check to see that the username isn't taken
        let takenUserName = await optionalGetByUserName(state.userName);
        if (takenUserName) {
            return {
                status: 'USERNAME_NOT_UNIQUE'
            };
        }

        return {
            status: 'CREATE_ACCOUNT',
            email: profileEmail.value
        };
    } catch (err) {
        return {
            status: 'FAILED',
            error: err
        };
    }
}
