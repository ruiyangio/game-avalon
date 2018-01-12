import React from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';
import Button from './Button.jsx';
import Card from './Card.jsx';
import CharacterCard from './CharacterCard.jsx';
import PlayerCard from './PlayerCard.jsx';
import QuestBoard from './QuestBoard.jsx';
import Modal from './Modal.jsx';
import * as util from '../util';
import '../css/game.scss';
import '../css/layout.scss';

export default class GameBoard extends React.Component {
    static get propTypes() {
        return {
            history: PropTypes.any,
            'history.push': PropTypes.func,
            gameInfo: PropTypes.object,
            changeGameHandler: PropTypes.func,
            'gameInfo.users': PropTypes.array
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            alertText: '',
            actionsAlert: '',
            currUserId: null,
            leaveGameModalOpen: false,
            gameBrokenNoticeModalOpen: false
        };

        this.creatorBackToLobby = this.creatorBackToLobby.bind(this);
        this.playerBackToLobby = this.playerBackToLobby.bind(this);
        this.startGame = this.startGame.bind(this);
        this.readyGame = this.readyGame.bind(this);
        this.setAlert = this.setAlert.bind(this);
        this.clearAlert = this.clearAlert.bind(this);
        this.setActionsAlert = this.setActionsAlert.bind(this);
        this.clearActionsAlert = this.clearActionsAlert.bind(this);
        this.getCurrentUser = this.getCurrentUser.bind(this);
        this.getReadyText = this.getReadyText.bind(this);
        this.readyReview = this.readyReview.bind(this);
        this.confirmTeaming = this.confirmTeaming.bind(this);
        this.playerCardSelectHandler = this.playerCardSelectHandler.bind(this);
        this.questSelectHandler = this.questSelectHandler.bind(this);
        this.reviewQuest = this.reviewQuest.bind(this);
        this.assassinate = this.assassinate.bind(this);
        this.giveLady = this.giveLady.bind(this);
        this.claimsGood = this.claimsGood.bind(this);
        this.reviewLadyResult = this.reviewLadyResult.bind(this);
        this.disableLadyReview = this.disableLadyReview.bind(this);
        this.closeLeaveGameModal = this.closeLeaveGameModal.bind(this);
        this.openLeaveGameModal = this.openLeaveGameModal.bind(this);
        this.leaveGameModalConfirm = this.leaveGameModalConfirm.bind(this);
        this.getLeaveGameModalText = this.getLeaveGameModalText.bind(this);
        this.openGameBrokenNoticeModal = this.openGameBrokenNoticeModal.bind(this);
        this.closeGameBrokenNoticeModal = this.closeGameBrokenNoticeModal.bind(this);
        this.gameBrokenNoticeModalConfirm = this.gameBrokenNoticeModalConfirm.bind(this);
    }

    componentDidMount() {
        const self = this;

        util.getUser().then(user => {
            self.setState({
                currUserId: user.id
            });
        });

        util.subScribeLeaveGame(gameId => {
            const currGameId = util.getGameId();
            if (gameId === currGameId) {
                util.clearGameId();
                this.openGameBrokenNoticeModal();
            }
        });
    }

    getCurrentUser() {
        for (let i = 0; i < this.props.gameInfo.users.length; i++) {
            if (this.props.gameInfo.users[i].id === this.state.currUserId) {
                return this.props.gameInfo.users[i];
            }
        }
    }

    getReadyText() {
        const currUser = this.getCurrentUser();
        return (currUser && currUser.gameInfo.status === 'Ready') ? 'Cancel' : 'Ready';
    }

    getGameSummary() {
        const summary = this.props.gameInfo.summary;
        if (summary) {
            let summaryText = `Good: ${summary.good}, Evil: ${summary.evil}, Special Characters: `;
            let prefix = '';
            summary.characters.forEach(characterName => {
                summaryText += `${prefix} ${characterName}`;
                prefix = ',';
            });
            return summaryText;
        }
    }

    getNotice() {
        const currUser = this.getCurrentUser();

        if (!this.props.gameInfo.status || !currUser) {
            return '';
        }

        switch(this.props.gameInfo.status) {
        case 'Init': {
            return '';
        }
        case 'Review': {
            return 'Look at your Identity card and information you know. Click Ready in the actions section when finished. Remeber to hide the information';
        }
        case 'Teaming': {
            if (currUser.gameInfo.leader) {
                if (this.props.gameInfo.currRound === 4) {
                    return 'This is the fifth round and your team will go';
                }
                else {
                    return 'Choose a quest and team members. Click Confirm when finished.';
                }
            }
            else {
                if (this.props.gameInfo.currRound === 4) {
                    return 'This is the fifth round. The leader\'s team will go';
                }
                else {
                    return 'Please wait for the current quest leader to choose a quest and team.';
                }
            }
        }
        case 'Voting': {
            return 'The chosen quest and players are highlighted. Please Vote. You can not change vote after clicking Yes or No';
        }
        case 'QuestReview': {
            let yes = 0;
            let no = 0;
            this.props.gameInfo.users.forEach(user => {
                if (user.gameInfo.status === 'Yes.Reviewed' || user.gameInfo.status === 'Yes') yes++;
                if (user.gameInfo.status === 'No.Reviewed' || user.gameInfo.status === 'No') no++;
            });

            if (yes > no) {
                return 'The selected quest is approved. Please review the voting and click next';
            }
            else {
                return 'The selected quest is not approved. Please review the voting and click next';
            }
        }
        case 'QuestGoing': {
            if (!currUser.gameInfo.selected) {
                return 'Please wait for the selected players to vote for the quest';
            }
            else {
                return 'Please decide if the quest should success or fail. Only you can see your vote. You may not change your vote after clicking the buttons';
            }
        }
        case 'GoodEnd': {
            return 'Good has won';
        }
        case 'EvilEnd': {
            return 'Evil has won';
        }
        case 'Assassinating': {
            return 'Good and evils are revealed and Assassin will choose a character to kill';
        }
        case 'Giving lady': {
            if (!currUser.gameInfo.hasLady) {
                return 'Please wait for the Lady of the lake investigation';
            }
            else {
                return 'Please select a player to investigate. The player must not have owned Lady card before';
            }
        }
        case 'Investigating': {
            if (!currUser.gameInfo.hasLady && !currUser.gameInfo.selected) {
                return 'Please wait for the Lady of lake to investigate the selected player';
            }
            else if (currUser.gameInfo.selected) {
                return 'Your identity is revealed to the player who owns Lady of the lake card';
            }
            else {
                return 'Please look at the selected player\'s identity and decide what you want to claim the player to be';
            }
        }
        case 'LadyReview': {
            return 'Please review the selected user\'s investigation result. Remember this only reflect the lady card owner\'s claim';
        }
        default: {
            return '';
        }
        }
    }

    setAlert(text) {
        this.setState({
            alertText: text
        });
    }

    clearAlert() {
        this.setState({
            alertText: ''
        });
    }

    setActionsAlert(text) {
        this.setState({
            actionsAlert: text
        });
    }

    clearActionsAlert() {
        this.setState({
            actionsAlert: ''
        });
    }

    creatorBackToLobby() {
        const self = this;
        const currUser = self.getCurrentUser();
        if (!currUser) {
            return;
        }

        const deleteGameUri = `/api/game/${this.props.gameInfo.id}`;
        util.deleteRequest(deleteGameUri).then(deleteStatus => {
            if (deleteStatus === 404 ) {
                this.props.history.push('/lobby');
                return;
            }
            else if (deleteStatus !== 204) {
                return;
            }

            util.sendGameBroken(this.props.gameInfo.id);    
            util.clearGameId();
            util.sendGameListChanged();
            this.props.history.push('/lobby');
        });
    }

    playerBackToLobby() {
        const self = this;
        const currUser = this.getCurrentUser();
        if (!currUser) {
            return;
        }

        const leaveGameUri = `/api/game/${this.props.gameInfo.id}/removeuser`;
        const payLoad = {
            user: {
                id: currUser.id
            }
        };

        util.putRequest(leaveGameUri, payLoad).then(res => {
            const changeRes = res.data;
            if (res.status === 404) {
                this.props.history.push('/lobby');
                return;
            }

            if (!changeRes.changeResolved) {
                return;
            }

            if (
                self.props.gameInfo.status !== 'Init' &&
                self.props.gameInfo.status !== 'GoodEnd' &&
                self.props.gameInfo.status !== 'EvilEnd'
            ) {
                util.sendGameBroken(self.props.gameInfo.id);
                util.sendGameListChanged();
            }
            else {
                util.sendGameChanged();    
            }

            util.clearGameId();
            this.props.history.push('/lobby');
        });
    }

    startGame() {
        const self = this;
        const userObjs = self.props.gameInfo.users;

        if (userObjs.length < self.props.gameInfo.playerNumber) {
            self.setAlert('Please wait for more players to join the game');
            return;
        }

        let allReady = userObjs.every(userObj => {
            return userObj.gameInfo.status === 'Ready';
        });

        if (!allReady) {
            self.setAlert('Not all players are ready');
            return;
        }

        const startGameUrl = `/api/game/${this.props.gameInfo.id}/startgame`;
        const payload = {
            user: {
                id: self.state.currUserId
            }
        };

        util.putRequest(startGameUrl, payload).then(res => {
            const changeRes = res.data;
            if (changeRes.changeResolved) {
                util.sendGameChanged();
                self.clearAlert();
            }
        });
    }

    readyGame() {
        const changeReadyUrl = `/api/game/${this.props.gameInfo.id}/changeuserstatus`;
        const currUser = this.getCurrentUser();
        let readyStatus = currUser.gameInfo.status;
        if (readyStatus === 'Ready') {
            readyStatus = 'Not Ready';
        }
        else {
            readyStatus = 'Ready';
        }

        const payload = {
            user: {
                id: currUser.id,
                status: readyStatus
            }
        };

        util.putRequest(changeReadyUrl, payload).then((res => {
            const changeRes = res.data;
            if (changeRes.changeResolved) {
                util.sendGameChanged();
            }
        }));
    }

    readyReview() {
        const changeReadyUrl = `/api/game/${this.props.gameInfo.id}/changeuserstatus`;
        const currUser = this.getCurrentUser();

        const payload = {
            user: {
                id: currUser.id,
                status: 'Ready'
            }
        };

        util.putRequest(changeReadyUrl, payload).then((res => {
            const changeRes = res.data;
            if (changeRes.changeResolved) {
                util.sendGameChanged();
            }
        }));
    }

    disableReviewButton() {
        const currUser = this.getCurrentUser();
        return currUser && currUser.gameInfo.status === 'Ready';
    }

    confirmTeaming() {
        const currUsers = this.props.gameInfo.users;
        const currQuests = this.props.gameInfo.quests;

        const selectedUserIds = currUsers.reduce((result, currUser) => {
            if (currUser.gameInfo.selected) {
                result.push(currUser.id);
            }
            return result;
        }, []);

        const selectedQuestsIndex = currQuests.reduce((result, quest, i) => {
            if (quest.selected) {
                result.push(i);
            }
            return result;
        }, []);

        // Validate quest
        if (selectedQuestsIndex.length === 0) {
            this.setActionsAlert('Please select a quest');
            return;
        }
        else if (selectedQuestsIndex.length !== 1) {
            this.setActionsAlert('Please only select one quest');
            return;
        }

        const selectedIndex = selectedQuestsIndex[0];
        const selectedQuest = currQuests[selectedIndex];
        const neededPlayers = selectedQuest.playerNumber;

        if (selectedIndex === 4) {
            let doneQuests = 0;
            for (let i = 0; i < selectedIndex; i++) {
                if (currQuests[i].status === 'Success' || currQuests[i].status === 'Failed') {
                    doneQuests++;
                }
            }

            if (doneQuests < 2) {
                this.setActionsAlert('Please do first four quests');
                return;
            }
        }

        if (selectedUserIds.length !== neededPlayers) {
            this.setActionsAlert(`The selected quest needs ${neededPlayers} players`);
            return;
        }

        const doQuestUri = `/api/game/${this.props.gameInfo.id}/doquest`;
        const payLoad = {
            questUsers: selectedUserIds,
            questIndex: selectedIndex
        };

        util.putRequest(doQuestUri, payLoad).then(res => {
            const changeRes = res.data;
            if (changeRes.changeResolved) {
                util.sendGameChanged();
            }
        });
    }

    disableVoteButton() {
        const currUser = this.getCurrentUser();
        return currUser && (currUser.gameInfo.status === 'Yes' || currUser.gameInfo.status === 'No');
    }

    voteQuest(vote) {
        const voteStatus = vote ? 'Yes' : 'No';

        const voteUri = `/api/game/${this.props.gameInfo.id}/changeuserstatus`;
        const currUser = this.getCurrentUser();

        const payLoad = {
            user: {
                id: currUser.id,
                status: voteStatus
            }
        };

        util.putRequest(voteUri, payLoad).then(res => {
            const changeRes = res.data;
            if (changeRes.changeResolved) {
                util.sendGameChanged();
            }
        });
    }

    disableQuestReviewButton() {
        const currUser = this.getCurrentUser();
        return currUser && (currUser.gameInfo.status === 'Yes.Reviewed' || currUser.gameInfo.status === 'No.Reviewed');
    }

    reviewQuest() {
        const currUser = this.getCurrentUser();
        if (!currUser) {
            return;
        }

        const changeStatusUri = `/api/game/${this.props.gameInfo.id}/changeuserstatus`;
        const payLoad = {
            user: {
                id: currUser.id,
                status: `${currUser.gameInfo.status}.Reviewed`
            }
        };

        util.putRequest(changeStatusUri, payLoad).then(res => {
            const changeRes = res.data;
            if (changeRes.changeResolved) {
                util.sendGameChanged();
            }
        });
    }

    disableSuccessFailButton() {
        const currUser = this.getCurrentUser();
        return currUser && (currUser.gameInfo.status === 'Success' || currUser.gameInfo.status === 'Fail');
    }

    successFailQuest(vote) {
        const voteStatus = vote ? 'Success' : 'Fail';

        const voteUri = `/api/game/${this.props.gameInfo.id}/changeuserstatus`;
        const currUser = this.getCurrentUser();

        const payLoad = {
            user: {
                id: currUser.id,
                status: voteStatus
            }
        };

        util.putRequest(voteUri, payLoad).then(res => {
            const changeRes = res.data;
            if (changeRes.changeResolved) {
                util.sendGameChanged();
            }
        });
    }

    assassinate() {
        const currUser = this.getCurrentUser();
        if (!currUser) {
            return;
        }

        const selectedUsers = this.props.gameInfo.users.reduce((result, currUser) => {
            if (currUser.gameInfo.selected) {
                result.push(currUser);
            }
            return result;
        }, []);

        if (selectedUsers.length !== 1) {
            this.setActionsAlert('Please select one player to kill');
            return;
        }

        const selectedUser = selectedUsers[0];
        if (selectedUser.id === currUser.id) {
            this.setActionsAlert('You can not assassinate yourself');
            return;
        }
        else if (selectedUser.gameInfo.status !== 'Good') {
            this.setActionsAlert('You should assassinate a good player');
            return;
        }

        const assassinUri = `/api/game/${this.props.gameInfo.id}/assassinate`;

        const payLoad = {
            user: {
                id: selectedUser.id
            }
        };

        util.putRequest(assassinUri, payLoad).then(res => {
            const changeRes = res.data;
            if (changeRes.changeResolved) {
                util.sendGameChanged();
            }
        });
    }

    giveLady() {
        const currUser = this.getCurrentUser();
        if (!currUser) {
            return;
        }

        const selectedUsers = this.props.gameInfo.users.reduce((result, currUser) => {
            if (currUser.gameInfo.selected) {
                result.push(currUser);
            }
            return result;
        }, []);

        if (selectedUsers.length !== 1) {
            this.setActionsAlert('Please select one player to investigate');
            return;
        }

        const selectedUser = selectedUsers[0];
        if (selectedUser.id === currUser.id) {
            this.setActionsAlert('You can not give lady card to yourself');
            return;
        }
        else if (selectedUser.gameInfo.hadLady) {
            this.setActionsAlert('This player used to own the lady card');
            return;
        }

        const requestUri = `/api/game/${this.props.gameInfo.id}/givelady`;
        const payLoad = {
            user: {
                id: selectedUser.id
            },
            requester: {
                id: currUser.id
            }
        };
        util.putRequest(requestUri, payLoad).then(res => {
            const changeRes = res.data;
            if (changeRes.changeResolved) {
                util.sendGameChanged();
            }
        });
    }

    claimsGood(isGood) {
        const currUser = this.getCurrentUser();
        if (!currUser) {
            return;
        }

        const selectedUsers = this.props.gameInfo.users.reduce((result, currUser) => {
            if (currUser.gameInfo.selected) {
                result.push(currUser);
            }
            return result;
        }, []);

        const selectedUser = selectedUsers[0];

        const requestUri = `/api/game/${this.props.gameInfo.id}/claimsgood`;
        const payLoad = {
            user: {
                id: selectedUser.id
            },
            requester: {
                id: currUser.id
            },
            isGood: isGood
        };
        util.putRequest(requestUri, payLoad).then(res => {
            const changeRes = res.data;
            if (changeRes.changeResolved) {
                util.sendGameChanged();
            }
        });
    }

    reviewLadyResult() {
        const changeReadyUrl = `/api/game/${this.props.gameInfo.id}/changeuserstatus`;
        const currUser = this.getCurrentUser();

        let reviewStatus = 'Reviewed';
        if (currUser.gameInfo.status === 'Good' || currUser.gameInfo.status === 'Evil') {
            reviewStatus = `${currUser.gameInfo.status}.Reviewed`;
        }

        const payload = {
            user: {
                id: currUser.id,
                status: reviewStatus
            }
        };

        util.putRequest(changeReadyUrl, payload).then((res => {
            const changeRes = res.data;
            if (changeRes.changeResolved) {
                util.sendGameChanged();
            }
        }));
    }

    disableLadyReview() {
        const currUser = this.getCurrentUser();
        return currUser && (
            currUser.gameInfo.status === 'Reviewed' ||
            currUser.gameInfo.status === 'Good.Reviewed' ||
            currUser.gameInfo.status === 'Evil.Reviewed'
        );
    }

    getGameActions() {
        const game = this.props.gameInfo;
        const currUser = this.getCurrentUser();
        if (!currUser) {
            return;
        }

        switch(game.status) {
        case 'Init': {
            if (currUser.id === this.props.gameInfo.creator) {
                return <Button text='Start' clickHandler={ this.startGame } />;
            }
            else {
                return <Button text={ (this.getReadyText()) } clickHandler={ this.readyGame } />;
            }
        }
        case 'Review': {
            return <Button text='Ready' clickHandler={ this.readyReview } isDisabled={ this.disableReviewButton() } />;
        }
        case 'Teaming': {
            if (currUser.gameInfo.leader) {
                return <Button text='Confirm Quest' clickHandler={ this.confirmTeaming } />;
            }
            else {
                return 'No actions needed. Please wait.';
            }
        }
        case 'Voting': {
            return  <div className='game-board--actions-button'>
                <Button text='Yes' theme='positive' clickHandler={ () => this.voteQuest(true) } isDisabled={ this.disableVoteButton() } />
                <Button text='No' theme='negative' clickHandler={ () => this.voteQuest(false) } isDisabled={ this.disableVoteButton() } />
            </div>;
        }
        case 'QuestReview': {
            return <Button text='Next' clickHandler={ this.reviewQuest } isDisabled={ this.disableQuestReviewButton() } />;
        }
        case 'QuestGoing': {
            if (!currUser.gameInfo.selected) {
                return 'No actions needed. Please wait.';
            }
            else {
                return  <div className='game-board--actions-button'>
                    <Button text='Success' theme='positive' clickHandler={ () => this.successFailQuest(true) } isDisabled={ this.disableSuccessFailButton() } />
                    <Button text='Fail' theme='negative' clickHandler={ () => this.successFailQuest(false) } isDisabled={ this.disableSuccessFailButton() } />
                </div>;
            }
        }
        case 'GoodEnd': {
            return 'No actions needed. Good has won';
        }
        case 'EvilEnd': {
            return 'No actions needed. Evil has won';
        }
        case 'Assassinating': {
            const currRole = currUser.gameInfo.character;
            if (!currRole || currRole.name !== 'Assassin') {
                return 'No actions needed. Please wait for the Assasin';
            }
            else {
                return <Button text='Confirm' clickHandler={ this.assassinate } />; 
            }
        }
        case 'Giving lady': {
            if (!currUser.gameInfo.hasLady) {
                return 'No actions needed. Please wait';
            }
            else {
                return <Button text='Give Lady' clickHandler={ this.giveLady } />; 
            }
        }
        case 'Investigating': {
            if (!currUser.gameInfo.hasLady) {
                return 'No actions needed. Please wait';
            }
            else {
                return  <div className='game-board--actions-button'>
                    <Button text='Good' theme='positive' clickHandler={ () => this.claimsGood(true) } />
                    <Button text='Evil' theme='negative' clickHandler={ () => this.claimsGood(false) } />
                </div>;
            }
        }
        case 'LadyReview': {
            return <Button text='Next' clickHandler={ this.reviewLadyResult } isDisabled={ this.disableLadyReview() } />;
        }
        default: {
            return;
        }
        }
    }

    playerCardSelectHandler(userObj) {
        const currUser = this.getCurrentUser();
        if (
            !currUser ||
            (this.props.gameInfo.status !== 'Teaming' && this.props.gameInfo.status !== 'Assassinating' && this.props.gameInfo.status !== 'Giving lady') ||
            (this.props.gameInfo.status === 'Teaming' && !currUser.gameInfo.leader) ||
            (this.props.gameInfo.status === 'Assassinating' && (currUser && currUser.gameInfo.character.name !== 'Assassin')) ||
            (this.props.gameInfo.status === 'Giving lady' && (currUser && !currUser.gameInfo.hasLady))
        ) {
            return;
        }

        this.clearActionsAlert();
        userObj.gameInfo.selected = !userObj.gameInfo.selected;
        this.props.changeGameHandler(this.props.gameInfo);
    }

    questSelectHandler(quest) {
        const currUser = this.getCurrentUser();
        if (
            !currUser ||
            (this.props.gameInfo.status !== 'Teaming' && this.props.gameInfo.status !== 'Assassinating') ||
            (this.props.gameInfo.status === 'Teaming' && !currUser.gameInfo.leader) ||
            (this.props.gameInfo.status === 'Assassinating' && (currUser && currUser.gameInfo.character.name !== 'Assassin')) ||
            quest.status === 'Success' ||
            quest.status === 'Failed'
        ) {
            return;
        }

        this.clearActionsAlert();
        quest.selected = !quest.selected;
        this.props.changeGameHandler(this.props.gameInfo);
    }

    openLeaveGameModal() {
        this.setState({
            leaveGameModalOpen: true
        });
    }

    closeLeaveGameModal() {
        this.setState({
            leaveGameModalOpen: false
        });
    }

    leaveGameModalConfirm() {
        const currUser = this.getCurrentUser();
        if (!currUser) {
            return;
        }

        if (currUser.id === this.props.gameInfo.creator) {
            this.creatorBackToLobby();
        }
        else {
            this.playerBackToLobby();
        }
    }

    openGameBrokenNoticeModal() {
        this.setState({
            gameBrokenNoticeModalOpen: true
        });
    }

    closeGameBrokenNoticeModal() {
        this.setState({
            gameBrokenNoticeModalOpen: false
        });
    }

    gameBrokenNoticeModalConfirm() {
        this.props.history.push('/lobby');
    }

    getLeaveGameModalText() {
        const currUser = this.getCurrentUser();
        if (!currUser) {
            return '';
        }

        if (currUser.id === this.props.gameInfo.creator) {
            return 'This game will be deleted if you leave now. Please confirm.';
        }

        if (
            this.props.gameInfo.status !== 'Init' &&
            this.props.gameInfo.status !== 'GoodEnd' &&
            this.props.gameInfo.status !== 'EvilEnd'
        ) {
            return 'The game is started but not done. If you leave now, the game will be deleted.';
        }
        else {
            return 'You want to leave the game?';
        }
    }

    render() {
        return (
            <div className='col-10 game-board'>
                <Card title='GameBoard'>
                    <div className='game-board--name'>
                        { this.props.gameInfo.name }
                    </div>
                    {
                        this.props.gameInfo.status === 'Init' ?
                            <div className='game-board--summary'>
                                { this.getGameSummary() }
                            </div>
                            :
                            <div className='game-board--notice animated shake'>
                                <span className='game-board--notice-header'>Notice:</span>
                                { this.getNotice() }
                            </div>
                    }
                    {
                        this.props.gameInfo.status === 'Init' && 
                        <div className='game-board--alert'>
                            <span>{ this.state.alertText }</span>
                        </div>
                    }
                    <div className='game-board--leave-button'>
                        <Button text='Leave' theme='cancel' clickHandler={ this.openLeaveGameModal }/>
                    </div>
                    <div className='game-board--actions'>
                        <div className='game-board--actions-text'>Game Actions</div>
                        { this.getGameActions() }
                        <div className='game-board--actions-alert'>{ this.state.actionsAlert }</div>
                    </div>
                    <div className='game-board--users'>
                        <div className='game-board--users-header'>Players: </div>
                        {
                            this.props.gameInfo.users.map((user, i) =>
                                <PlayerCard key={ `k${i}` } user={ user } clickHandler={ () => this.playerCardSelectHandler(user) } />
                            )
                        }
                    </div>
                    {
                        this.props.gameInfo.status !== 'Init' &&
                        <div className='game-board--quest-board'>
                            <div className='game-board--quests'>
                                <QuestBoard gameInfo={ this.props.gameInfo } clickHandler={ this.questSelectHandler } />
                            </div>
                        </div>
                    }
                    {
                        this.props.gameInfo.status !== 'Init' && this.props.gameInfo.history.length > 0 &&
                        <div className='game-board--history'>
                            <div className='game-board--history-header'>Quest History</div>
                            {
                                this.props.gameInfo.history.map((historyEntry, i) =>
                                    <div key={ i }>
                                        { historyEntry }
                                    </div>
                                )
                            }
                        </div>
                    }
                    {
                        this.props.gameInfo.status !== 'Init' &&
                        <div className='game-board--character'>
                            <CharacterCard user={ this.getCurrentUser() } users={ this.props.gameInfo.users } />
                        </div>
                    }
                </Card>
                {
                    this.state.leaveGameModalOpen &&
                    <Portal>
                        <Modal
                            title='Leave game'
                            buttonText='Confirm'
                            closeHandler={ this.closeLeaveGameModal }
                            confirmHandler={ this.leaveGameModalConfirm }
                        >
                            { this.getLeaveGameModalText() }
                        </Modal>
                    </Portal>
                }
                {
                    this.state.gameBrokenNoticeModalOpen &&
                    <Portal>
                        <Modal
                            title='Player or creator left'
                            buttonText='OK'
                            closeHandler={ this.gameBrokenNoticeModalConfirm }
                            confirmHandler={ this.gameBrokenNoticeModalConfirm }
                        >
                            The creator or one of the players has left the game
                        </Modal>
                    </Portal>
                }
            </div>
        );
    }
}
