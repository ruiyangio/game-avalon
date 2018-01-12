const userService = require('../service/user-service');
const constants = require('../common/constants');

module.exports = function socketAuthMiddleWare(socket, next) {
    if (socket.handshake.query && socket.handshake.query.token) {
        let token = `${constants.auth.bearer} ${socket.handshake.query.token}`;
        const userTokenVerifyResult = userService.verifyToken(token);
        if (!userTokenVerifyResult.payload.sessionValid) {
            next(new Error('Authentication error'));
        }
        else {
            next();
        }
    }
};

