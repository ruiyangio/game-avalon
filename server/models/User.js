const uuidv1 = require('uuid/v1');

class User {
    constructor(userName) {
        this.userName = userName;
        this.id = uuidv1();
        this.color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
        this.gameInfo = null;
    }

    serialize() {
        return {
            id: this.id,
            userName: this.userName,
            color: this.color
        };
    }
}

module.exports = User;
