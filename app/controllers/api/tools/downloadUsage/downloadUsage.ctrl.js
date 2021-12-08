'use strict';
let express = require('express'),
    auth = require('../../../auth/auth.service'),
    env = require('../../../../../config/config').env,
    config = rootRequire('config/credentials').downloadUsage,
    log = rootRequire('config/log'),
    router = express.Router({caseSensitive: true});
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: config.host, // 'smtp.gbif.org',
    port: config.port, //25,
    secure: false, 
    auth: {
        user: config.sender,
    },
});

module.exports = function (app) {
    app.use('/api/tools/download-usage', router);
};

router.post('/', auth.isAuthenticated(), async (req, res) => {
    try {
        await sendMail(req.body, req.user);
        res.sendStatus(201);
    } catch (error) {
        log.error(error);
        res.sendStatus(400);
    }
});
const removeLineBreaks = (txt) =>
    txt ? txt.replace(/(\r\n|\n|\r)/gm, ' ') : '';

const sendMail = async (data, user) => {
    console.log('ENV ' + env);
    let envPrefix = env === 'prod' ? '' : `[${env.toUpperCase()}] `;
    let mailOptions = {
        from: `"${envPrefix}GBIF portal" <${config.sender}>`, // sender address
        to: config.recipient, // list of receivers
        subject: `${envPrefix}GBIF Download usage`, // Subject line
        text: `username: ${user.userName}\nemail: ${
            user.email
        }\ntitle: ${removeLineBreaks(data.title)}\nauthors: ${removeLineBreaks(
            data.authors
        )}\nlink: ${data.link || ''}\ndate: ${data.date}\ncomments: ${
            removeLineBreaks(data.comments) || ''
        }`, // plain text body
    };
    let info = await transporter.sendMail(mailOptions);
    return info;
};
