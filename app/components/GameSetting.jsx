import React from 'react';
import PropTypes from 'prop-types';
import Button from '../components/Button.jsx';
import Card from './Card.jsx';
import Checkbox from './Checkbox.jsx';
import DropDown from './DropDown.jsx';
import Input from '../components/Input.jsx';
import Label from '../components/Label.jsx';
import * as util from '../util';
import '../css/game.scss';
import '../css/layout.scss';

const playersLimit = [];
for (let i = 5; i <= 10; i++) {
    playersLimit.push({
        text: i.toString(),
        value: i
    });
}

const optionalCharacterNames = [
    'Percival',
    'Mordred',
    'Oberon',
    'Morgana',
    'Lady of the lake'
];

const GAME_RULES = {
    '5': {
        good: 3,
        evil: 2
    },
    '6': {
        good: 4,
        evil: 2,
    },
    '7': {
        good: 4,
        evil: 3,
    },
    '8': {
        good: 5,
        evil: 3,
    },
    '9': {
        good: 6,
        evil: 3,
    },
    '10': {
        good: 6,
        evil: 4,
    },
};

export default class GameSetting extends React.Component {
    static get propTypes() {
        return {
            history: PropTypes.any,
            'history.push': PropTypes.func,
            switchToGameBoardHandler: PropTypes.func
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            playerNumber: playersLimit[0],
            gameName: '',
            alertText: '',
            characterNames: optionalCharacterNames,
            characters: {
                'Percival': {
                    name: 'Percival',
                    isChecked: false,
                    isGood: true,
                    note: 'Note: Either Mordred or Morgana must also be chosen in a game of 5',
                },
                'Mordred': {
                    name: 'Mordred',
                    isChecked: false,
                    isGood: false,
                },
                'Oberon': {
                    name: 'Oberon',
                    isChecked: false,
                    isGood: false,
                },
                'Morgana': {
                    name: 'Morgana',
                    isChecked: false,
                    isGood: false,
                },
                'Lady of the lake': {
                    name: 'Lady of the lake',
                    isChecked: false,
                    isSpecial: true
                }
            },
        };

        this.changeSelectedItem = this.changeSelectedItem.bind(this);
        this.backToLobby = this.backToLobby.bind(this);
        this.toGameBoard = this.toGameBoard.bind(this);
        this.changeGameName = this.changeGameName.bind(this);
        this.clearAlert = this.clearAlert.bind(this);
        this.setAlert = this.setAlert.bind(this);
        this.handlerCharacterSelection = this.handlerCharacterSelection.bind(this);
        this.validateSettings = this.validateSettings.bind(this);
    }

    validateSettings() {
        const currCharacters = this.state.characters;
        let ruleLimit = Object.assign({}, GAME_RULES[this.state.playerNumber.value]);
        ruleLimit.good--;
        ruleLimit.evil--;

        let good = 0;
        let evil = 0;
        let hasPercival = false;
        let validPercival = false;

        Object.keys(currCharacters).forEach(characterName => {
            let character = currCharacters[characterName];
            if (!character.isChecked || character.isSpecial) {
                return;
            }

            if (character.isGood) {
                good++;
            }
            else {
                evil++;
            }

            if (character.name === 'Percival') {
                hasPercival = true;
            }

            if (character.name === 'Mordred' || character.name === 'Morgana') {
                validPercival = true;
            }
        });

        if (good > ruleLimit.good) {
            this.setAlert('Too many good characters');
            return false;
        }

        if (evil > ruleLimit.evil) {
            this.setAlert('Too many evil characters');
            return false;
        }

        if (this.state.playerNumber.value === 5 && hasPercival && !validPercival) {
            this.setAlert('Either Mordred or Morgana must also be chosen');
            return false;
        }

        return true;
    }

    changeSelectedItem(item) {
        this.setState({
            playerNumber: item
        });
    }

    changeGameName(e) {
        this.clearAlert();
        this.setState({
            gameName: e.target.value
        });
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

    toGameBoard() {
        const self = this;
        if (!this.state.gameName) {
            this.setAlert('Game name is required');
            return;
        }

        if (!this.state.gameName.length > 30) {
            this.setAlert('Game name should have less than 30 characters');
            return;
        }

        if (!this.validateSettings()) {
            return;
        }

        util.getUser().then(user => {
            const gameSettings = {
                name: self.state.gameName,
                creator: user.id,
                playerNumber: self.state.playerNumber.value,
                optionalCharacters: Object.keys(self.state.characters).reduce((result, characterName) => {
                    let character = self.state.characters[characterName];
                    if (character.isChecked) {
                        result[character.name] = true;
                    }
    
                    return result;
                }, {})
            };

            util.postRequest('/api/game', gameSettings).then(game => {
                util.sendGameListChanged();
                util.setGameId(game.id);
                self.props.switchToGameBoardHandler(game);
            });
        });
    }

    backToLobby() {
        this.props.history.push('/lobby');
    }

    handlerCharacterSelection(e, item) {
        this.clearAlert();
        let currCharacters = this.state.characters;
        currCharacters[item.name].isChecked = e.target.checked;
        this.setState({
            characters: currCharacters
        });
    }

    getOverview() {
        const currRule = GAME_RULES[this.state.playerNumber.value];
        return `Good: ${currRule.good}, Evil: ${currRule.evil}`;
    }

    render() {
        return (
            <div className='col-5 game-setting'>
                <Card title='Game settings'>
                    <div className='game-setting--game-name'>
                        <Label text='Game name'/>
                        <Input changeHandler={ this.changeGameName } />
                    </div>
                    <div className='game-setting--overview'>
                        <DropDown
                            list={ playersLimit }
                            selectedItem={ this.state.playerNumber }
                            selectionChangeHandler={ this.changeSelectedItem }
                            labelText='Number of players:'
                        />
                        <span>
                            { (this.getOverview()) }
                        </span>
                    </div>
                    <div className='game-setting--characters'>
                        <div className='game-setting--characters-note'>
                            <span>Optional characters: (Merlin and Assassin are always chosen)</span>
                        </div>
                        {
                            this.state.characterNames.map((name, i) => {
                                let character = this.state.characters[name];
                                return <div key={ i }>
                                    <Checkbox
                                        isChecked={ character.isChecked }
                                        labelText={ character.name }
                                        note={ character.note }
                                        changeHandler={ (e) => this.handlerCharacterSelection(e, character) }
                                    />
                                </div>;
                            })
                        }
                    </div>
                    <div className='game-setting--alert'>
                        <span>{ this.state.alertText }</span>
                    </div>
                    <div className='game-setting--buttons'>
                        <Button text='Start' clickHandler={ this.toGameBoard } />
                        <Button text='Back to Lobby' theme='cancel' clickHandler={ this.backToLobby }/>
                    </div>
                </Card>
            </div>
        );
    }
}
