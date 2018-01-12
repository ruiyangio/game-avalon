const express = require('express');
const router = express.Router();
const constants = require('./common/constants');
const userService = require('./service/user-service');
const gameService = require('./service/game-service');

/* APIs */
router.post('/api/login', (req, res) => {
    const registerResult = userService.register(req);
    res.status(registerResult.status);
    res.contentType = constants.headers.json;
    res.send(registerResult.payload);
});

router.get('/api/verify', (req, res) => {
    const verifyResult = userService.verifyToken(req.header(constants.auth.apiTokenName));
    res.contentType = constants.headers.json;
    res.status(verifyResult.status);
    res.send(verifyResult.payload);
});

router.get('/api/user', (req, res) => {
    const userResult = userService.getUserFromToken(req);
    res.contentType = constants.headers.json;
    res.status(userResult.status);
    res.send(userResult.payload);
});

router.get('/api/users', (req, res) => {
    const users = userService.getAllUsers();
    res.contentType = constants.headers.json;
    res.status(200);
    res.send(Object.keys(users).map(userId => {
        return {
            userName: users[userId].userName,
            color: users[userId].color
        };
    }));
});

router.post('/api/game', (req, res) => {
    const gameSetting = req.body;
    const creationResult = gameService.createGame(gameSetting);
    res.contentType = constants.headers.json;
    res.status(201);
    res.send(creationResult);
});

router.get('/api/game/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    const userId = req.query.userId;
    const gameResult = gameService.getGamePayload(gameId, userId);
    res.contentType = constants.headers.json;
    res.status(gameResult.status);
    res.send(gameResult.payload);
});

// RPC API
router.put('/api/game/:gameId/:action', (req, res) => {
    const gameId = req.params.gameId;
    const action = req.params.action;
    const body = req.body;
    const gameResult = gameService.applyChanges(gameId, action, body);
    res.contentType = constants.headers.json;
    res.status(gameResult.status);
    res.send(gameResult.payload);
});

router.delete('/api/game/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    const gameDeletionResult = gameService.deleteGamePlayload(gameId);
    res.contentType = constants.headers.json;
    res.status(gameDeletionResult.status);
    res.send(gameDeletionResult.payload);
});

router.get('/api/games', (req, res) => {
    const gameResult = gameService.getGamesPayload();
    res.contentType = constants.headers.json;
    res.status(gameResult.status);
    res.send(gameResult.payload);
});

// Admin APIs
router.put('/admin/cleangames', (req, res) => {
    const cred = req.body.cred;
    const adminResult = {
        status: 400,
        payload: {
            adminResolved: false
        }
    };

    if (cred === 'ray') {
        gameService.deleteAllGames();
        adminResult.status = 200;
        adminResult.payload.adminResolved = true;
    }

    res.contentType = constants.headers.json;
    res.status(adminResult.status);
    res.send(adminResult.payload);
});

router.put('/admin/cleanusers', (req, res) => {
    const cred = req.body.cred;
    const adminResult = {
        status: 400,
        payload: {
            adminResolved: false
        }
    };

    if (cred === 'ray') {
        userService.deleteAllUsers();
        adminResult.status = 200;
        adminResult.payload.adminResolved = true;
    }

    res.contentType = constants.headers.json;
    res.status(adminResult.status);
    res.send(adminResult.payload);
});

module.exports = router;
