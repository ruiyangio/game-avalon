const STATUS_INIT = 'Init';

class Quest {
    constructor(playerNumber, needsTwoFails = false) {
        this.playerNumber = playerNumber;
        this.needsTwoFails = needsTwoFails;
        this.status = STATUS_INIT;
        this.selected = false;
        this.fails = 0;
        this.players = null;
    }
}

module.exports = Quest;
