import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import Game from './Game.jsx';
import Lobby from './Lobby.jsx';
import ColorLabel from '../components/ColorLabel.jsx';
import ChatBox from '../components/ChatBox.jsx';
import PrivateRoute from '../components/PrivateRoute.jsx';
import * as util from '../util';
import '../css/lobby.scss';
import '../css/layout.scss';

export default class Main extends React.Component {
    static get propTypes() {
        return {
            children: PropTypes.any
        };
    }

    constructor() {
        super();
        this.state = {
            user: {}
        };
    }

    componentDidMount() {
        util.getUser().then(user => {
            if (user) {
                this.setState({
                    user: user
                });
            }
        });
    }

    render() {
        return (
            <div className='main-content'>
                <div className='user-nav'>
                    <span className='user-nav--description'>Your user name: </span>
                    <ColorLabel text={ this.state.user.userName } colorHex = { this.state.user.color }/>
                </div>
                <div className='main-cards flex-grid'>
                    <Router>
                        <Switch>
                            <PrivateRoute path='/lobby' component={ Lobby } />
                            <PrivateRoute path='/game' component={ Game } />
                        </Switch>
                    </Router>
                    <div className='col-2 chat-box-container'>
                        <ChatBox />
                    </div>
                </div>
            </div>
        );
    }
}
