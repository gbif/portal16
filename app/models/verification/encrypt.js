'use strict';

const crypto = require('crypto'),
    ENCRYPTION_KEY = rootRequire('config/credentials').encryptionKey; //Must be 256 bytes (32 characters)

const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', new Buffer(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    let textParts = text.split(':');
    let iv = new Buffer(textParts.shift(), 'hex');
    let encryptedText = new Buffer(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

function encryptJSON(o) {
    try {
        return encrypt(JSON.stringify(o));
    } catch (err) {
        cb(new Error('Failed to stringify and encrypt json'));
    }

}

function decryptJSON(e) {
    try {
        return JSON.parse(decrypt(e));
    } catch (err) {
        cb(new Error('Failed to decrypt and parse json'));
    }
}

module.exports = { decrypt, encrypt, encryptJSON, decryptJSON };