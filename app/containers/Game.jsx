import React from 'react';
import Header from '../components/Header.jsx';
import GameSetting from '../components/GameSetting.jsx';
import GameBoard from '../components/GameBoard.jsx';
import * as util from '../util';
import '../css/game.scss';
import '../css/layout.scss';

export default class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inSetting: true,
            gameInfo: null
        };

        this.switchToGameBoard = this.switchToGameBoard.bind(this);
        this.changeGameInfo = this.changeGameInfo.bind(this);
    }

    componentDidMount() {
        this.pullGame();
        util.subScribeRefreshGame(() => this.pullGame());
    }

    pullGame() {
        const self = this;
        const gameId = util.getGameId();
        if (self.state.inSetting && !gameId) {
            return;
        }

        if (!gameId) {
            self.props.history.push('/lobby');
            return;
        }

        util.getUser().then(user => {
            util.requestGame(gameId, user.id).then(game => {
                if (!game) {
                    self.props.history.push('/lobby');
                }
                else {
                    self.setState({
                        gameInfo: game,
                        inSetting: false
                    });
                }
            });
        });
    }

    switchToGameBoard(game) {
        this.setState({
            inSetting: false,
            gameInfo: game
        });
    }

    changeGameInfo(game) {
        this.setState({
            gameInfo: game
        });
    }

    render() {
        return (
            <div className='game-container col-7'>
                <Header theme='sub' text='Game' />
                <div className='flex-grid'>
                    {
                        this.state.inSetting ?
                            <GameSetting {...this.props} switchToGameBoardHandler={ this.switchToGameBoard } />
                            :
                            <GameBoard {...this.props} gameInfo={ this.state.gameInfo } changeGameHandler={ this.changeGameInfo } />
                    }
                </div>
            </div>
        );
    }
}
