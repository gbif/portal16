"use strict";

var NodeCache = require("node-cache"),
    randomstring = require("randomstring"),
    _ = require('lodash'),
    path = require('path'),
    Chance = require('chance'),
    chance = new Chance();

module.exports = humanVerifier;

function humanVerifier(conf) {
    var config = conf,
        challengeCache = new NodeCache({stdTTL: 60, checkperiod: 10, errorOnMissing: true});

    function getRandomImages(group, number, isCorrect) {
        var totalImagesinCategory = group.images.length;
        if (totalImagesinCategory < number) {
            throw 'Not enough images in group'
        } else {
            var images = chance.pickset(group.images, number);
            return images.map(function (img) {
                return {
                    isCorrect: isCorrect,
                    name: randomstring.generate(5),
                    img: group.folder + '/' + img
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
            answer = [],
            imageMap = {};

        //add a mapping between random names and the actual image paths
        images.forEach(function (e) {
            imageMap[e.name] = e.img;
        });
        queryImage = path.join('image', challenge.id, images.pop().name);

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
            return path.join('image', challenge.id, e.name)
        });

        //create challenge obj to return
        challenge.challenge = queryImage;
        challenge.options = images;

        //corresponding secret with answers and resolver for image names
        var challengeSecret = {
            answer: answer,
            imageResolver: imageMap
        };

        //save challenge answer in a temporary storage that is deleted after around 60 seconds
        challengeCache.set(challenge.id, challengeSecret, function (err, success) {
            if (!err && success) {
                cb(null, challenge);
            } else {
                cb('failed to create challenge');
            }
        });
    }

    //verify that the answer to the challenge is correct. takes id and array of ids (corresponding to the array)
    //returns true or false
    function verify(id, answer, cb) {
        if (!id || !_.isArray(answer) || answer.length != 3) {
            return cb(false);
        }
        challengeCache.get(id, function (err, challenge) {
            if (!err) {
                //the challenge should be deleted so there is only one attempt
                challengeCache.del(id, function () {//err, count
                    //failure isn't good. if it isn't deleted the user will have two attempts.
                    //try again? try to overwrite it? flush everything?
                });
                //is the responded answer array the same as the one we know to bt the answer
                let isHumanEnough = _.isEqual(challenge.answer, answer.sort());
                //response with delay as comparisons are vulnerable to timing attacks - a fixed total delay would of course be better
                setTimeout(function(){
                    return cb(isHumanEnough);
                }, chance.integer({min: 100, max: 200}) );
            } else {
                //if something fails, then simply return false for not verified.
                return cb(false);
            }
        });
    }

    /*
     when return challenge img, then names are not the same from time to time. this method resolves the proper name of the file to return
     */
    function resolveImageName(id, name, cb) {
        challengeCache.get(id, function (err, challenge) {
            if (!err) {
                var imageName = _.get(challenge, 'imageResolver.' + name, '');
                cb(null, imageName);
            } else {
                cb('NOT_FOUND');
            }
        });
    }

    return {
        getChallenge: getChallenge,
        verify: verify,
        resolveImageName: resolveImageName
    }
}


