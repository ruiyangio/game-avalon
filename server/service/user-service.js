const debug = require('debug');
const jwt = require('jsonwebtoken');
const constants = require('../common/constants');
const config = require('../../config');
const User = require('../models/User');

// Store users in memory for now
const users = {};

const self = module.exports = {
    verifyToken: (bearerToken) => {
        const authToken = extractBearerToken(bearerToken);
        const invalidResult = {
            status: 401,
            payload: {
                sessionValid: false,
                error: 'Invalid auth token'
            }
        };

        if (!authToken) {
            return invalidResult;
        }

        const user = decryptUser(authToken);
        if (!user) {
            return invalidResult;
        }

        if (user.expired) {
            self.unregister(user.id);

            return {
                status: 401,
                payload: {
                    sessionValid: false,
                    error: `The token has expired. The current expire setting is ${config.tokenExp}`
                }
            };
        }

        if (!users[user.id]) {
            let restoredUser = new User(user.userName);
            restoredUser.id = user.id;
            restoredUser.color = user.color;
            users[user.id] = restoredUser;
        }

        return {
            status: 200,
            payload: {
                sessionValid: true
            }
        };
    },
    register: (req) => {
        const userName = req.body.userName;

        if (!userName) {
            return {
                status: 400,
                payload: {
                    userResolved: false,
                    error: 'User name can not be null or empty string'
                }
            };
        }

        const newUser = new User(userName);
        users[newUser.id] = newUser;

        return {
            status: 201,
            payload: {
                userResolved: true,
                token: jwt.sign({
                    expiresIn: config.tokenExp,
                    data: newUser.serialize()
                }, config.jwtSecret)
            }
        };
    },
    getUserFromToken: (req) => {
        const authToken = extractBearerToken(req.header(constants.auth.apiTokenName));
        const user = decryptUser(authToken);
        if (users[user.id]) {
            return {
                status: 200,
                payload: users[user.id].serialize()
            };
        }
        else {
            return {
                status: 404,
                payload: {
                    error: 'User not found'
                }
            };
        }
    },
    unregister: (userId) => {
        delete users[userId];
    },
    getUser: (userId) => {
        return users[userId];
    },
    getAllUsers: () => {
        return users;
    },
    deleteAllUsers: () => {
        Object.keys(users).forEach(userId => {
            delete users[userId];
        });          
    }
};

// Private methods
function extractBearerToken(tokenString) {
    const tokenRegPattern = `^${constants.auth.bearer}\\s+(.*)$`;
    const tokenReg = new RegExp(tokenRegPattern, 'g');
    const matches = tokenReg.exec(tokenString);
    if (matches !== null && matches.length != 0) {
        return matches[1];
    }
}

function decryptUser(token) {
    try {
        const decryptedUser = jwt.verify(token, config.jwtSecret, {
            maxAge: config.tokenExp
        });
        return decryptedUser.data;
    }
    catch (err) {
        debug(err.message);
        if (err.name === 'TokenExpiredError') {
            const expiredUserInfo = jwt.decode(token);
            if (expiredUserInfo) {
                let expiredUser = expiredUserInfo.data;
                expiredUser.expired = true;
                return expiredUser;
            }
        }
        return null;
    }
}
