module.exports = {
    headers: {
        jsonContentType: 'application/json'
    },
    auth: {
        localStoreName: 'avalon.auth',
        apiTokenName: 'Authorization',
        bearer: 'Bearer '
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
    game: {
        gameIdName: 'avalon.game.id'
    }
};