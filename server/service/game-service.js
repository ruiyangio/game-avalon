const Game = require('../models/Game');
const STATUS = require('../models/Status');

const games = {};

const self = module.exports = {
    createGame: (gameSetting) => {
        const game = new Game(gameSetting);
        game.initialize();
        games[game.id] = game;
        return game.serialize();
    },
    deleteGame: (gameId) => {
        const game = games[gameId];
        if (!game) {
            return false;
        }

        game.clearGame();
        delete games[gameId];
        return true;
    },
    deleteGamePlayload: (gameId) => {
        if (!gameId) {
            return {
                status: 400,
                payload: {
                    gameDeleted: false,
                    error: 'Game id must be supplied'
                }
            };
        }

        const gameDeleted = self.deleteGame(gameId);
        if (!gameDeleted) {
            return {
                status: 401,
                payload: {
                    gameDeleted: false,
                    error: 'Game is not found'
                }
            };
        }
        else {
            return {
                status: 204,
                payload: {
                    gameDeleted: true
                }
            };
        }
    },
    getGames: () => {
        return games;
    },
    getGamesPayload: () => {
        return {
            status: 200,
            payload: Object.keys(games).map(gameId => games[gameId].serialize())
        };
    },
    getGame: (gameId) => {
        return games[gameId];
    },
    getGamePayload: (gameId, userId) => {
        if (!gameId) {
            return {
                status: 400,
                payload: {
                    gameResolved: false,
                    error: 'Game id must be supplied'
                }
            };
        }

        if (!userId) {
            return {
                status: 400,
                payload: {
                    gameResolved: false,
                    error: 'User id must be supplied as Query param'
                }
            };
        }
        
        const game = self.getGame(gameId);

        if (!game) {
            return {
                status: 404,
                payload: {
                    gameResolved: false,
                    error: 'Game not found'
                }
            };
        }

        return {
            status: 200,
            payload: {
                gameResolved: true,
                game: game.serialize(userId)
            }
        };
    },
    applyChanges: (gameId, action, body) => {
        const game = self.getGame(gameId);
        let response = {
            status: 200,
            payload: {
                changeResolved: false
            }
        };

        if (!game) {
            response.status = 404;
            response.payload.error = 'Game not found';
            return response;
        }

        switch(action) {
        case 'adduser': {
            if (!game.addUser(body.user.id)) {
                response.status = 400;
                response.payload.error = 'Game is full';
                return response;
            }
            else {
                response.status = 200;
                response.payload.changeResolved = true;
                return response;
            }
        }
        case 'changeuserstatus': {
            if (!game.changeUserStatus(body.user.id, body.user.status)) {
                response.status = 404;
                response.payload.error = 'User not found';
                return response;
            }
            else {
                response.status = 200;
                response.payload.changeResolved = true;
                return response;
            }
        }
        case 'startgame': {
            if (!game.startGame(body.user.id)) {
                response.status = 400;
                response.payload.error = 'Only creator should start game';
                return response;
            }
            else {
                response.status = 200;
                response.payload.changeResolved = true;
                return response;
            }
        }
        case 'doquest': {
            if (!game.doQuest(body.questUsers, body.questIndex)) {
                response.status = 400;
                response.payload.error = 'Error when tring to set up quest';
                return response;
            }
            else {
                response.status = 200;
                response.payload.changeResolved = true;
                return response;
            }
        }
        case 'assassinate': {
            if (!game.assassinate(body.user.id)) {
                response.status = 400;
                response.payload.error = 'Error when tring to assassinate';
                return response;
            }
            else {
                response.status = 200;
                response.payload.changeResolved = true;
                return response;
            }
        }
        case 'givelady': {
            if (!game.giveLady(body.requester.id, body.user.id)) {
                response.status = 400;
                response.payload.error = 'Error when tring to give lady';
                return response;
            }
            else {
                response.status = 200;
                response.payload.changeResolved = true;
                return response;
            }
        }
        case 'claimsgood': {
            if (!game.claimsGood(body.requester.id, body.user.id, body.isGood)) {
                response.status = 400;
                response.payload.error = 'Error when tring to investigate';
                return response;
            }
            else {
                response.status = 200;
                response.payload.changeResolved = true;
                return response;
            }
        }
        case 'removeuser': {
            if (
                game.status !== STATUS.INIT &&
                game.status !== STATUS.END_EVIL &&
                game.status !== STATUS.END_GOOD
            ) {
                self.deleteGame(game.id);
                response.status = 200;
                response.payload.changeResolved = true;
                return response;
            }

            if (!game.removeUser(body.user.id)) {
                response.status = 400;
                response.payload.error = 'Error when tring to remove user';
                return response;
            }
            else {
                response.status = 200;
                response.payload.changeResolved = true;
                return response;
            }
        }
        default: {
            response.status = 400;
            response.payload.error = 'No action found for the api';
            return response;
        }
        }
    },
    getGameId: (userId) =>{
        let gameId = null;

        Object.keys(games).forEach(gameId => {
            const game = games[gameId];
            if (game.users[userId]) {
                gameId = game.id;
            }
        });

        return gameId;
    },
    deleteAllGames: () => {
        Object.keys(games).forEach(gameId => {
            if (!gameId) {
                return;
            }

            const currGame = games[gameId];
            currGame.clearGame();
            delete games[gameId];
        });
    }
};
