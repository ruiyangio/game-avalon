const path = require('path');
const userService = require('../service/user-service');
const constants = require('../common/constants');

module.exports = function authMiddleWare(req, res, next) {
    if (req.url.match(/\/admin\/cleangames/g) || req.url.match(/\/admin\/cleanusers/g)) {
        next();
    }
    else if (!req.url.match(/\/api\/.*/g)) {
        res.contentType = constants.headers.html;
        res.sendFile(path.join(process.cwd(), '/dist/index.html'));
    }
    else if (!req.url.match(/\/api\/login/g)) {
        const userTokenVerifyResult = userService.verifyToken(req.header(constants.auth.apiTokenName));
        if (!userTokenVerifyResult.payload.sessionValid) {
            res.contentType = constants.headers.json;
            res.status(userTokenVerifyResult.status);
            res.send(userTokenVerifyResult.payload);
        }
        else {
            next();
        }
    }
    else {
        next();
    }
};
