import React from 'react';
import PropTypes from 'prop-types';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Header from '../components/Header.jsx';
import ColorLabel from '../components/ColorLabel.jsx';
import ActionLabel from '../components/ActionLabel.jsx';
import Modal from '../components/Modal.jsx';
import { Portal } from 'react-portal';
import * as util from '../util';
import '../css/lobby.scss';
import '../css/layout.scss';

export default class Layout extends React.Component {
    static get propTypes() {
        return {
            history: PropTypes.any,
            'history.push': PropTypes.func
        };
    }

    constructor() {
        super();
        this.state = {
            users: [],
            games: [],
            currentUserId: null,
            joinGameModalOpen: false
        };

        this.toGamePage = this.toGamePage.bind(this);
        this.pullUsers = this.pullUsers.bind(this);
        this.pullGames = this.pullGames.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.closeJoinGameModal = this.closeJoinGameModal.bind(this);
        this.openJoinGameModal = this.openJoinGameModal.bind(this);
    }

    componentDidMount() {
        util.clearGameId();
        const component = this;
        util.getUser().then(user => {
            if (user) {
                component.setState({
                    currentUserId: user.id
                });
            }
        });

        component.pullUsers().then(() => component.pullGames());

        util.subScribePullUsers(component.pullUsers);
        util.subScribePullGames(component.pullGames);
    }

    pullUsers() {
        const component = this;
        return util.getRequest('/api/users')
            .then(users => {
                if (!users) {
                    return;
                }

                component.setState({
                    users: users
                });
            });
    }

    pullGames() {
        const component = this;
        return util.getRequest('/api/games')
            .then(games => {
                if (!games) {
                    return;
                }

                component.setState({
                    games: games
                });
            });
    }

    toGamePage() {
        this.props.history.push('/game');
    }

    joinGame(gameId) {
        const newUserPayload = {
            user: {
                id: this.state.currentUserId
            }
        };

        util.addUserToGame(gameId, newUserPayload).then(res => {
            const changeRes = res.data;
            if (changeRes.changeResolved) {
                util.setGameId(gameId);
                util.sendGameChanged();
                this.props.history.push('/game');
            }
            else {
                this.openJoinGameModal();
            }
        });
    }

    openJoinGameModal() {
        this.setState({
            joinGameModalOpen: true
        });
    }

    closeJoinGameModal() {
        this.setState({
            joinGameModalOpen: false
        });
    }

    render() {
        return (
            <div className='lobby-container col-7'>
                <Header theme='sub' text='Lobby' />
                <div className='flex-grid'>
                    <div className='col-3'>
                        <Card title='Game list' theme='lobby'>
                            {
                                this.state.games.map((game, i) =>
                                    <div className='lobby-game-label' key={ i }>
                                        <ActionLabel labelText={ game.name } buttonText='Join' actionHandler={ () => { this.joinGame(game.id); } } />
                                    </div>
                                )
                            }
                        </Card>
                    </div>
                    <div className='col-2'>
                        <Button text='Create Game' clickHandler={ this.toGamePage }/>
                    </div>
                    <div className='col-3'>
                        <Card title='User list' theme='lobby'>
                            {
                                this.state.users.map((user, i) =>
                                    <div className='lobby-user-label' key={ i }>
                                        <ColorLabel text={ user.userName } colorHex={ user.color }/>
                                    </div>
                                )
                            }
                        </Card>
                    </div>
                </div>
                {
                    this.state.joinGameModalOpen &&
                    <Portal>
                        <Modal
                            title='Can not join the game'
                            buttonText='OK'
                            closeHandler={ this.closeJoinGameModal }
                            confirmHandler={ this.closeJoinGameModal }
                        >
                            The game is full or the game already has a player with the same name
                        </Modal>
                    </Portal>
                }
            </div>
        );
    }
}

