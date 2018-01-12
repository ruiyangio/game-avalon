module.exports = {
    auth: {
        apiTokenName: 'Authorization',
        bearer: 'Bearer'
    },
    socketEvents: {
        messageSend: 'message::send',
        messageEmit: 'message::emit',
        userJoin: 'user::newUser',
        userPullUsers: 'user::pullUsers',
        gameListChanged: 'game::listChanged',
        gamePullGames: 'game::pullGames',
        gameChanged: 'game::gameChanged',
        gameRefreshGame: 'game::refreshGame',
        gameLeaveGame: 'game::leaveGame',
        gameBroken: 'game::gameBroken'
    },
    headers: {
        json: 'application/json',
        html: 'text/html'
    }
};
