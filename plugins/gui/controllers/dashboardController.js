var jwt = require('jsonwebtoken');
var logger = require('../utils/logger');
var mailer = require('../mail/mailer');

module.exports.show = function (req, res) {
    //Get the users email, name, and profile picture
    var domain = req.user.split("@")[1];
    if (domain == 'sofi.org' || domain == 'sofi.com') {
        res.render('dashboard');
    } else {
        req.logout();
        res.status(401);
        res.render('401');
    }
};
module.exports.showAbout = function(req, res) {
    res.render('about');
};
module.exports.sendDailySummary = function (req, res) {
    var authHeader = req.headers['authorization'];
    var token = null;
    var tokenType = null;
    if (authHeader) {
        tokenType = authHeader.split(' ')[0];
        token = authHeader.split(' ')[1];
    }
    if (token) {
        if (tokenType && tokenType == "Bearer") {
            jwt.verify(token, process.env.FG_JWT_SECRET, function (err, decoded) {
                if (err) {
                    logger.error("Failed to authenticate token.", err);
                    return res.json({success: false, message: 'Failed to authenticate token.'});
                } else {
                    logger.info("processing replay status and sending email");
                    mailer.processReplayStatusEmail();
                    res.json({success: true, message: 'Send Daily Summary completed'})
                }
            });
        } else {
            logger.error("invalid token type or token type was not specified");
            res.json({success: false, message: 'Invalid token type or token was not specified'});
        }
    } else {
        res.json({success: false, message: 'No token provided'})
    }
};
