'use strict';
let express = require('express'),
    auth = require('../../../auth/auth.service'),
    env = require('../../../../../config/config').env,
    config = rootRequire('config/credentials').downloadUsage,
    log = rootRequire('config/log'),
    router = express.Router({caseSensitive: true});
let nodemailer;
let transporter;

try {    
nodemailer = require('nodemailer');
transporter = nodemailer.createTransport({
    host: config.host, // 'smtp.gbif.org',
    port: config.port, //25,
    secure: false, 
    auth: {
        user: config.sender,
    },
});
} catch (error) {
    log.error(error);
}


module.exports = function (app) {
    app.use('/api/tools/download-usage', router);
};

router.post('/', auth.isAuthenticated(), async (req, res) => {
    if (env === 'staging') {
        // for some reason we are not able to require nodemailer on staging - for now disabled
        res.sendStatus(501);
    } else {
        try {
            await sendMail(req.body, req.user);
            res.sendStatus(201);
        } catch (error) {
            log.error(error);
            res.sendStatus(400);
        }
    }
});
const removeLineBreaks = (txt) =>
    txt ? txt.replace(/(\r\n|\n|\r)/gm, ' ') : '';

const sendMail = async (data, user) => {
    let envPrefix = env === 'prod' ? '' : `[${env.toUpperCase()}] `;
    let mailOptions = {
        from: `"${envPrefix}GBIF portal" <${config.sender}>`, // sender address
        to: config.recipient, // list of receivers
        subject: `${envPrefix}GBIF Download usage`, // Subject line
        text: `download: ${data.key}
username: ${user.userName}
email: ${user.email}
title: ${removeLineBreaks(data.title)}
type: ${data.type}
authors: ${removeLineBreaks(data.authors)}
link: ${data.link || ''}
date: ${data.date}
comments: ${removeLineBreaks(data.comments) || ''}`, // plain text body
    };
    
    let info = await transporter.sendMail(mailOptions);
    return info;
};
