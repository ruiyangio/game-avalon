import constants from '../constants';
import socketIO from 'socket.io-client';

//// Rest Client
export function getRequest(relativeUrl, useToken = true) {
    const token = getToken();
    let options = { method: 'get' };
    if (useToken && token !== null) {
        options.headers = {};
        options.headers[constants.auth.apiTokenName] = constants.auth.bearer + token;
    }

    return fetch(relativeUrl, options).then(res => {
        if (res.status === 401) {
            clearToken();
        }
        return res.json();
    });
}

export function postRequest(relativeUrl, payload, useToken = true) {
    const token = getToken();
    let options = {
        method: 'post',
        headers: {
            'Content-Type': constants.headers.jsonContentType,
        },
        body: JSON.stringify(payload)
    };

    if (useToken && token !== null) {
        options.headers[constants.auth.apiTokenName] = constants.auth.bearer + token;
    }

    return fetch(relativeUrl, options).then(res => {
        if (res.status === 401) {
            clearToken();
        }
        return res.json();
    });
}

export function putRequest(relativeUrl, payload, useToken = true) {
    const token = getToken();
    let options = {
        method: 'put',
        headers: {
            'Content-Type': constants.headers.jsonContentType,
        },
        body: JSON.stringify(payload)
    };

    if (useToken && token !== null) {
        options.headers[constants.auth.apiTokenName] = constants.auth.bearer + token;
    }

    return fetch(relativeUrl, options).then(res => {
        if (res.status === 401) {
            clearToken();
        }

        return res.json().then(data => (
            {
                status: res.status,
                data: data
            }
        )
        );
    });
}

export function deleteRequest(relativeUrl, useToken = true) {
    const token = getToken();
    let options = { method: 'delete' };
    if (useToken && token !== null) {
        options.headers = {};
        options.headers[constants.auth.apiTokenName] = constants.auth.bearer + token;
    }

    return fetch(relativeUrl, options).then(res => {
        if (res.status === 401) {
            clearToken();
        }
        return res.status;
    });
}

//// Auth Helpers
export function isAuthenticated() {
    const token = sessionStorage.getItem(constants.auth.localStoreName);
    if (!token) {
        return false;
    }
    else {
        return true;
    }
}

export function setToken(token) {
    sessionStorage.setItem(constants.auth.localStoreName, token);
}

export function getToken() {
    const token = sessionStorage.getItem(constants.auth.localStoreName);
    if (!token) {
        return null;
    }

    return token;
}

export function clearToken() {
    sessionStorage.removeItem(constants.auth.localStoreName);
}

//// Id Helper
let idHelperId = 0;

export function genId(prefix = 'avalon_id_') {
    idHelperId++;
    return prefix + idHelperId;
}

//// User Helper
let cachedUser = null;

export function requestUser() {
    return getRequest('/api/user').then(userRes => {
        cachedUser = userRes;
        return userRes;
    });
}

export function getUser() {
    if (!cachedUser){
        return requestUser();
    }

    let copyUser = Object.assign({}, cachedUser);

    return Promise.resolve(copyUser);
}

export function clearUser() {
    cachedUser = null;
}

//// Game Helper
export function requestGame(gameId, userId) {
    let gameUri = `/api/game/${gameId}?userId=${userId}`;
    return getRequest(gameUri).then(gameRes => {
        if (gameRes.gameResolved) {
            return gameRes.game;
        }
    });
}

export function addUserToGame(gameId, payload) {
    let gameUri = `/api/game/${gameId}/adduser`;
    return putRequest(gameUri, payload);
}

export function setGameId(gameId) {
    sessionStorage.setItem(constants.game.gameIdName, gameId);
}

export function getGameId() {
    return sessionStorage.getItem(constants.game.gameIdName);
}

export function clearGameId() {
    return sessionStorage.removeItem(constants.game.gameIdName);
}

//// Socket Helper
export function connectSocket() {
    return socketIO({
        query: { token: getToken() }
    });
}

export function sendMessage(message) {
    const sio = connectSocket();
    
    getUser().then(user => {
        delete user.id;
        user.message = message;
        sio.emit(constants.socketEvents.messageSend, JSON.stringify(user));
    });
}

export function subScribeMessage(callback) {
    const sio = connectSocket();

    sio.on(constants.socketEvents.messageEmit, message => callback(message));
}

export function sendNewUserJoined() {
    const sio = connectSocket();

    sio.emit(constants.socketEvents.userJoin);
}

export function subScribePullUsers(callback) {
    const sio = connectSocket();

    sio.on(constants.socketEvents.userPullUsers, () => callback());
}

export function sendGameListChanged() {
    const sio = connectSocket();

    sio.emit(constants.socketEvents.gameListChanged);
}

export function subScribePullGames(callback) {
    const sio = connectSocket();
    
    sio.on(constants.socketEvents.gamePullGames, () => callback());
}

export function sendGameChanged() {
    const sio = connectSocket();

    sio.emit(constants.socketEvents.gameChanged);
}

export function subScribeRefreshGame(callback) {
    const sio = connectSocket();
    
    sio.on(constants.socketEvents.gameRefreshGame, () => callback());
}

export function sendGameBroken(gameId) {
    const sio = connectSocket();

    sio.emit(constants.socketEvents.gameBroken, gameId);
}

export function subScribeLeaveGame(callback) {
    const sio = connectSocket();

    sio.on(constants.socketEvents.gameLeaveGame, gameId => callback(gameId));
}
