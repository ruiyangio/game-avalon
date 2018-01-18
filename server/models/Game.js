const uuidv4 = require('uuid/v4');
const userService = require('../service/user-service');
const Quest = require('./Quest');
const Character = require('./Character');
const STATUS = require('./Status'); 

const GAME_RULES = {
    '5': {
        good: 3,
        evil: 2,
        questPlayers: [2, 3, 2, 3, 3]
    },
    '6': {
        good: 4,
        evil: 2,
        questPlayers: [2, 3, 4, 3, 4]
    },
    '7': {
        good: 4,
        evil: 3,
        questPlayers: [2, 3, 3, 4, 4]
    },
    '8': {
        good: 5,
        evil: 3,
        questPlayers: [3, 4, 4, 5, 5]
    },
    '9': {
        good: 6,
        evil: 3,
        questPlayers: [3, 4, 4, 5, 5]
    },
    '10': {
        good: 6,
        evil: 4,
        questPlayers: [3, 4, 4, 5, 5]
    },
};

const QUESTS_NUMBER = 5;

class Game {
    constructor(gameSetting) {
        this.id = uuidv4();
        this.name = gameSetting.name;
        this.playerNumber = gameSetting.playerNumber;
        this.creator = gameSetting.creator;
        this.optionalCharacters = gameSetting.optionalCharacters;
        this.userNumber = 0;
        this.users = {};
        this.userIds = [];
        this.quests = [];
        this.characters = [];
        this.currLeaderIndex = 0;
        this.status = STATUS.INIT;
        this.gameRule = GAME_RULES[gameSetting.playerNumber];
        this.summary = {
            good: this.gameRule.good,
            evil: this.gameRule.evil,
            characters: ['Merlin', 'Assassin']
        };
        this.summary.characters = [...this.summary.characters, ...Object.keys(this.optionalCharacters)];
        this.hasLady = this.optionalCharacters.hasOwnProperty('Lady of the lake');
        this.finishedQuests = 0;
        this.history = [];
        this.countDown = gameSetting.countDown || 0;
    }

    _createQuests() {
        for (let i = 0; i < QUESTS_NUMBER; i++) {
            let needsTwoFails = (i === 3 && this.playerNumber >= 7) ? true : false;
            this.quests.push(new Quest(this.gameRule.questPlayers[i], needsTwoFails));
        }
    }

    _createCharacters() {
        let ruleLimit = Object.assign({}, this.gameRule);
        this.characters.push(new Character('Merlin', true, false));
        this.characters.push(new Character('Assassin', false, false));
        ruleLimit.good--;
        ruleLimit.evil--;

        Object.keys(this.optionalCharacters).forEach(characterName => {
            if (characterName === 'Percival') {
                this.characters.push(new Character('Percival', true, false));
                ruleLimit.good--;
            }
            else if (characterName === 'Mordred' || characterName === 'Morgana' || characterName === 'Oberon') {
                this.characters.push(new Character(characterName, false, false));
                ruleLimit.evil--;
            }
        });

        for (let i = 0; i < ruleLimit.good; i++) {
            this.characters.push(new Character('Loyal Servant', true, false));
        }

        for (let i = 0; i < ruleLimit.evil; i++) {
            this.characters.push(new Character('Evil Minion', false, false));
        }
    }

    initialize() {
        this.addUser(this.creator);
        this.changeUserStatus(this.creator, STATUS.READY);
        this.setLeader(this.creator);
        this._createQuests();
        this._createCharacters();
    }

    startGame(userId) {
        if (userId !== this.creator) {
            return false;
        }

        let copyCharacters = this.characters.slice();

        this.userIds.forEach(userId => {
            const user = this.users[userId];
            const randIndex = Math.floor(Math.random() * copyCharacters.length);
            user.gameInfo.character = copyCharacters[randIndex];
            copyCharacters.splice(randIndex, 1);
        });

        this.status = STATUS.REVIEW;
        this.changeAllUserStatus(STATUS.REVIEW);

        // Assign lady card
        if (this.hasLady) {
            const randomUserId = this.userIds[Math.floor(Math.random() * this.userIds.length)];
            this.users[randomUserId].gameInfo.hasLady = true;
        }

        return true;
    }

    setFifthPlayer(firstRound) {
        this.userIds.forEach(userId => {
            const currUser = this.users[userId];
            currUser.gameInfo.isFifth = false;
        });

        let increment = firstRound ? 4 : 5;

        let fifthIndex = this.currLeaderIndex + increment;
        if (fifthIndex > this.userIds.length - 1) {
            fifthIndex = fifthIndex - this.userIds.length;
        }
        this.users[this.userIds[fifthIndex]].gameInfo.isFifth = true;
    }

    addUser(userId) {
        if (this.users[userId]) {
            return true;
        }

        if (this.userNumber === this.playerNumber) {
            return false;
        }

        const newUser = userService.getUser(userId);
        if (!newUser) {
            return false;
        }

        for (let i = 0; i < this.userIds.length; i++) {
            const currUser = this.users[this.userIds[i]];
            if (currUser.userName === newUser.userName) {
                return false;
            }
        }

        this.userNumber++;

        this.users[userId] = newUser;
        this.users[userId].gameInfo = {
            id: this.id,
            status: STATUS.NOT_READY,
            character: null,
            leader: false,
            selected: false,
            hasLady: false,
            hadLady: false,
            isFifth: false
        };

        this.userIds.push(userId);

        return true;
    }

    changeAllUserStatus(status) {
        Object.keys(this.users).forEach(userId => {
            const currUser = this.users[userId];
            currUser.gameInfo.status = status;
        });
    }

    startQuest() {
        this.status = STATUS.QUEST_TEAMING;
        const currLeader = this.users[this.userIds[this.currLeaderIndex]];
        currLeader.gameInfo.leader = false;

        this.currLeaderIndex = Math.floor(Math.random() * this.userIds.length);
        const leaderId = this.userIds[this.currLeaderIndex];
        const leader = this.users[leaderId];
        leader.gameInfo.leader = true;

        this.changeAllUserStatus(STATUS.WAITING);
        this.changeUserStatus(leaderId, STATUS.LEADER);
        this.setFifthPlayer(true);
    }

    changeUserStatus(userId, status) {
        const user = this.users[userId];
        if (!user || !status) {
            return false;
        }

        user.gameInfo.status = status;

        if (this.status === STATUS.REVIEW) {
            // In review, check if every one is ready
            let allReady = true;

            this.userIds.forEach(userId => {
                const currUser = this.users[userId];
                if (currUser.gameInfo.status !== 'Ready') {
                    allReady = false;
                }
            });

            if (allReady) {
                this.startQuest();
            }
        }
        else if (this.status === STATUS.VOTING) {
            let allVoted = true;

            this.userIds.forEach(userId => {
                const currUser = this.users[userId];
                if (currUser.gameInfo.status !== 'Yes' && currUser.gameInfo.status !== 'No') {
                    allVoted = false;
                }
            });

            if (allVoted) {
                this.status = STATUS.QUEST_REVIEW;
            }
        }
        else if (this.status === STATUS.QUEST_GOING) {
            let allVoted = true;
            let fails = 0;
            let selectedUserNames = [];

            this.userIds.forEach(userId => {
                const currUser = this.users[userId];
                if (!currUser.gameInfo.selected) {
                    return;
                }

                selectedUserNames.push(currUser.userName);

                if (currUser.gameInfo.status !== 'Success' && currUser.gameInfo.status !== 'Fail') {
                    allVoted = false;
                }

                if (currUser.gameInfo.status === 'Fail') fails++;
            });

            if (allVoted) {
                let selectedQuest = null;
                let selectedQuestNumber = -1;

                for (let i = 0; i < this.quests.length; i++) {
                    if (this.quests[i].selected) {
                        selectedQuest = this.quests[i];
                        selectedQuestNumber = i + 1;
                        break;
                    }
                }

                if (selectedQuest.needsTwoFails && fails >= 2) {
                    selectedQuest.status = 'Failed';
                }
                else if (!selectedQuest.needsTwoFails && fails >= 1) {
                    selectedQuest.status = 'Failed';
                }
                else {
                    selectedQuest.status = 'Success';
                }

                selectedQuest.fails = fails;
                if (selectedUserNames.length) {
                    selectedQuest.players = selectedUserNames.join(', ');
                    let historyEntry = `${selectedQuest.players} went to Quest${selectedQuestNumber} and it's ${selectedQuest.status}`;
                    this.history.push(historyEntry);
                }
                this.finishedQuests++;

                this.endGameOrNextRound();
            }
        }
        else if (this.status === STATUS.QUEST_REVIEW) {
            let allReady = true;

            this.userIds.forEach(userId => {
                const currUser = this.users[userId];
                const statuses = currUser.gameInfo.status.split('.');

                if (statuses.length < 2 || statuses[1] !== 'Reviewed') {
                    allReady = false;
                }
            });

            if (allReady) {
                this.moveToQuestOrNextRound();
            }
        }
        else if (this.status === STATUS.LADY_REVIEW) {
            // In review, check if every one is ready
            let allReady = true;

            this.userIds.forEach(userId => {
                const currUser = this.users[userId];
                if (
                    currUser.gameInfo.status !== 'Reviewed' &&
                    currUser.gameInfo.status !== 'Good.Reviewed' &&
                    currUser.gameInfo.status !== 'Evil.Reviewed'
                ) {
                    allReady = false;
                }
            });

            if (allReady) {
                this.toNextRound();
            }
        }

        return true;
    }

    moveToQuestOrNextRound() {
        let yes = 0;
        let no = 0;

        this.userIds.forEach(userId => {
            const currUser = this.users[userId];
            if (currUser.gameInfo.status === 'Yes.Reviewed') yes++;
            if (currUser.gameInfo.status === 'No.Reviewed') no++;
        });

        const currLeader = this.users[this.userIds[this.currLeaderIndex]];

        // Quest goes
        if (yes > no || currLeader.gameInfo.isFifth) {
            this.status = STATUS.QUEST_GOING;
            this.userIds.forEach(userId => {
                const currUser = this.users[userId];

                if (currUser.gameInfo.selected) {
                    currUser.gameInfo.status = STATUS.VOTING;
                }
                else {
                    currUser.gameInfo.status = STATUS.WAITING;
                }
            });
        }
        else {
            this.toNextRound();
        }
    }

    toNextRound(setFifth) {
        this.status = STATUS.QUEST_TEAMING;
        this.clearSelections(STATUS.WAITING);

        if (setFifth) {
            this.setFifthPlayer();
        }

        this.users[this.userIds[this.currLeaderIndex]].gameInfo.leader = false;
        this.currLeaderIndex = (this.currLeaderIndex === this.userIds.length - 1) ? 0 : this.currLeaderIndex + 1;
        this.users[this.userIds[this.currLeaderIndex]].gameInfo.leader = true;
        this.users[this.userIds[this.currLeaderIndex]].gameInfo.status = STATUS.LEADER;
    }

    clearSelections(userStatus) {
        this.quests.forEach(quest => quest.selected = false);
        this.userIds.forEach(userId => {
            const currUser = this.users[userId];
            currUser.gameInfo.status = userStatus;
            currUser.gameInfo.selected = false;
        });
    }

    endGameOrNextRound() {
        let success = 0;
        let fails = 0;

        this.quests.forEach(quest => {
            if (quest.status === 'Success') success++;
            if (quest.status === 'Failed') fails++;
        });

        if (success === 3) {
            this.status = STATUS.ASSASSIN;
            this.clearSelections(STATUS.WAITING);
        }
        else if (fails === 3) {
            this.status = STATUS.END_EVIL;
            this.clearSelections(STATUS.QUEST_REVIEW);
        }
        else {
            if (this.hasLady && this.finishedQuests > 1) {
                // Start Lady phase
                this.status = STATUS.LADY_GIVE;
                this.clearSelections(STATUS.WAITING);
                this.userIds.forEach(userId => {
                    const currUser = this.users[userId];
                    if (currUser.gameInfo.hasLady) {
                        this.changeUserStatus(userId, STATUS.LADY_GIVE);
                    }
                });
                this.setFifthPlayer();
            }
            else {
                this.toNextRound(true);
            }
        }
    }

    doQuest(questUsers, questIndex) {
        questUsers.forEach(userId => {
            this.users[userId].gameInfo.selected = true;
        });

        this.quests[questIndex].selected = true;
        const currLeader = this.users[this.userIds[this.currLeaderIndex]];
        if (currLeader.gameInfo.isFifth) {
            this.moveToQuestOrNextRound();
        }
        else {
            this.status = STATUS.VOTING;
            this.changeAllUserStatus(STATUS.VOTING);
        }

        return true;
    }

    assassinate(targetId) {
        const killTarget = this.users[targetId];
        if (!killTarget) {
            return false;
        }

        killTarget.gameInfo.character.isAssassinated = true;
        
        if (killTarget.gameInfo.character.name !== 'Merlin') {
            this.status = STATUS.END_GOOD;
        }
        else {
            this.status = STATUS.END_EVIL;
        }

        return true;
    }

    giveLady(requesterId, targetId) {
        const target = this.users[targetId];
        const requester = this.users[requesterId];
        if (!target || !requester) {
            return false;
        }

        target.gameInfo.selected = true;

        if (target.gameInfo.character.isGood) {
            target.gameInfo.status = 'Good';
        }
        else {
            target.gameInfo.status = 'Evil';
        }

        this.status = STATUS.LADY_INVESTIGATING;
        requester.gameInfo.status = STATUS.LADY_INVESTIGATING;

        return true;
    }

    claimsGood(requesterId, targetId, isGood) {
        const target = this.users[targetId];
        const requester = this.users[requesterId];
        if (!target || !requester) {
            return false;
        }

        this.status = STATUS.LADY_REVIEW;
        this.changeAllUserStatus(STATUS.REVIEW);

        if (isGood) {
            target.gameInfo.status = 'Good';
        }
        else {
            target.gameInfo.status = 'Evil';
        }

        requester.gameInfo.hadLady = true;
        requester.gameInfo.hasLady = false;
        target.gameInfo.hasLady = true;

        return true;
    }

    setLeader(userId) {
        const user = this.users[userId];
        if (!user) {
            return;
        }

        const currLeader = this.users[this.currLeaderIndex];
        if (currLeader) {
            currLeader.gameInfo.leader = false;
        }

        user.gameInfo.leader = true;

        for (let i = 0; i < this.userIds.length; i++) {
            if (this.userIds[i] === userId) {
                this.currLeaderIndex = i;
            }
        }
    }

    removeUser(userId) {
        if (!this.users[userId]) {
            return false;
        }
        
        this.userNumber--;
        this.users[userId].gameInfo = null;
        delete this.users[userId];
        let indexToRemove = -1;

        this.userIds.forEach((id, i) => {
            if (id === userId ) {
                indexToRemove = i;
            }
        });

        if (indexToRemove >= 0) {
            this.userIds.splice(indexToRemove, 1);
        }

        return true;
    }

    getUsers() {
        return this.userIds.map(userId => this.users[userId]);
    }

    getFilteredUsers(userId) {
        if (!this.users[userId]) {
            return [];
        }

        const requesterRole = this.users[userId].gameInfo.character;
        const requester = this.users[userId];
        if (
            !requesterRole ||
            this.userIds.length < this.playerNumber
        ) {
            return this.getUsers();
        }

        return this.userIds.map(id => {
            // Deep copy user 
            let userObj = JSON.parse(JSON.stringify(this.users[id]));
            const userRole = userObj.gameInfo.character;
            if (!userRole) {
                return userObj;
            }

            if (this.status === STATUS.END_EVIL || this.status === STATUS.END_GOOD) {
                if (userRole.isAssassinated) {
                    userObj.gameInfo.status = `${userRole.name} Killed`;
                }
                else {
                    userObj.gameInfo.status = userRole.name;
                }
            }

            if (this.status === STATUS.ASSASSIN) {
                if (userRole.isGood) {
                    userObj.gameInfo.status = 'Good';
                }
                else if (userRole.name === 'Assassin') {
                    userObj.gameInfo.status = 'Assassin';
                }
                else if (!userRole.isGood) {
                    userObj.gameInfo.status = userRole.name;
                }
            }

            if (this.status == STATUS.LADY_INVESTIGATING) {
                if (!userObj.gameInfo.hasLady && !userObj.gameInfo.selected) {
                    userObj.gameInfo.status = STATUS.WAITING;
                }
                else if (!requester.gameInfo.hasLady && userObj.gameInfo.selected) {
                    userObj.gameInfo.status = STATUS.LADY_INVESTIGATED;
                }
            }

            if (id === userId) {
                return userObj;
            }

            if (
                (requesterRole.name === 'Merlin' && (userRole.isGood || userRole.name ==='Mordred')) ||
                (requesterRole.name === 'Percival' && userRole.name !== 'Merlin' && userRole.name !== 'Morgana') ||
                (!requesterRole.isGood && requesterRole.name !=='Oberon' && (userRole.isGood || userRole.name === 'Oberon')) ||
                (requesterRole.name === 'Loyal Servant') ||
                (requesterRole.name === 'Oberon')
            ) {
                userObj.gameInfo.character = null;
            }

            if (this.status === STATUS.QUEST_GOING) {
                if (userObj.gameInfo.selected && userObj.gameInfo.status !== STATUS.VOTING) {
                    userObj.gameInfo.status = 'Voted';
                }
            }

            return userObj;
        });
    }

    clearGame() {
        this.userIds.forEach(userId => {
            const user = this.users[userId];
            user.gameInfo = null;
        });
    }

    serialize(requesterId) {
        let payloadUsers = [];
        if (!requesterId) {
            payloadUsers = this.getUsers();
        }
        else {
            payloadUsers = this.getFilteredUsers(requesterId);
        }

        return {
            id: this.id,
            name: this.name,
            users: payloadUsers,
            creator: this.creator,
            playerNumber: this.playerNumber,
            quests: this.quests,
            summary: this.summary,
            status: this.status,
            history: this.history,
            countDown: this.countDown
        };
    }
}

module.exports = Game;
