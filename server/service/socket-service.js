const constants = require('../common/constants');

module.exports = function socketService(sio) {
    let _service = {};

    _service.handlers = function handlers(socket) {
        socket.on(constants.socketEvents.messageSend, message => {
            sio.emit(constants.socketEvents.messageEmit, message);
        });
        
        socket.on(constants.socketEvents.userJoin, () => {
            sio.emit(constants.socketEvents.userPullUsers);
        });

        socket.on(constants.socketEvents.gameListChanged, () => {
            sio.emit(constants.socketEvents.gamePullGames);
        });

        socket.on(constants.socketEvents.gameChanged, () => {
            sio.emit(constants.socketEvents.gameRefreshGame);
        });

        socket.on(constants.socketEvents.gameBroken, gameId => {
            sio.emit(constants.socketEvents.gameLeaveGame, gameId);
        });
    };

    return _service;
};
