"use strict";

var randomstring = require("randomstring"),
    _ = require('lodash'),
    path = require('path'),
    encrypt = require('./encrypt'),
    Chance = require('chance'),
    chance = new Chance();

module.exports = humanVerifier;

function humanVerifier(conf) {
    var config = conf;

    function getRandomImages(group, number, isCorrect) {
        var totalImagesinCategory = group.images.length;
        if (totalImagesinCategory < number) {
            throw 'Not enough images in group'
        } else {
            var images = chance.pickset(group.images, number);
            return images.map(function (img) {
                return {
                    isCorrect: isCorrect,
                    name: encrypt.encryptJSON({
                        issuedAt: Date.now(),
                        path: group.folder + '/' + img
                    })
                }
            });
        }
    }

    //get a challenge object. returns object with id, string (img name) and an array (img names)
    function getChallenge(cb) {
        var challenge = {};
        challenge.id = randomstring.generate(10);

        var categories = chance.pickset(config.groups, 3),
            cat1 = getRandomImages(categories[0], 4, true),
            cat2 = getRandomImages(categories[1], 3, false),
            cat3 = getRandomImages(categories[2], 3, false),
            images = _.concat(cat2, cat3, cat1),
            queryImage,
            answer = [];

        queryImage = images.pop().name;

        images = chance.shuffle(images);//images should be in a random order

        //set answer
        images.forEach(function (e, i) {
            if (e.isCorrect) {
                answer.push(i.toString());
            }
        });
        answer.sort();

        //reduce images to masked name only
        images = images.map(function (e) {
            return e.name
        });

        //create challenge obj to return
        challenge.challenge = queryImage;
        challenge.options = images;

        //corresponding secret with answers and resolver for image names
        var answerToken = {
            answer: answer,
            issuedAt: Date.now()
        };

        cb(null, {
            options: images,
            challenge: queryImage,
            id: encrypt.encryptJSON(answerToken)
        });
    }

    //verify that the answer to the challenge is correct. takes id and array of ids (corresponding to the array)
    //returns true or false
    function verify(encryptedAnswer, answer, cb) {
        try {
            if (!encryptedAnswer || !_.isArray(answer) || answer.length != 3) {
                return cb(false);
            }
            var challenge = encrypt.decryptJSON(encryptedAnswer);

            //is the responded answer array the same as the one we know to bt the answer
            let isHumanEnough = _.isEqual(challenge.answer, answer.sort());
            //response with delay as comparisons are vulnerable to timing attacks - a fixed total delay would of course be better
            setTimeout(function () {
                return cb(isHumanEnough);
            }, chance.integer({min: 100, max: 200}));
        } catch(err) {
            return cb(false);
        }
    }

    /*
     when return challenge img, then names are not the same from time to time. this method resolves the proper name of the file to return
     */
    function resolveImageName(name, cb) {
        try {
            var img = encrypt.decryptJSON(name);
            if (Date.now() - img.issuedAt < 1000 * 60) {
                cb(null, img.path);
            } else {
                cb('NOT_FOUND');
            }
        } catch (err) {
            cb('NOT_FOUND');
        }
    }

    return {
        getChallenge: getChallenge,
        verify: verify,
        resolveImageName: resolveImageName
    }
}