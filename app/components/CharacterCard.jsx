import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button.jsx';
import ColorLabel from './ColorLabel.jsx';
import '../css/charactercard.scss';

export default class CharacterCard extends React.Component {
    static get propTypes() {
        return {
            user: PropTypes.object,
            users: PropTypes.array
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            characterShown: true
        };

        this.toggleCharacter = this.toggleCharacter.bind(this);
    }

    getUserName() {
        if (!this.props.user) {
            return '';
        }

        return this.props.user.userName;
    }

    getUserColor() {
        if (!this.props.user) {
            return;
        }
        
        return this.props.user.color;
    }

    getCharacterName() {
        if (!this.props.user) {
            return '';
        }

        const currUser = this.props.user;
        const character = currUser.gameInfo.character;

        if (!character) {
            return '';
        }

        return `You are: ${character.name}`;
    }

    getCharacterNature() {
        if (!this.props.user) {
            return false;
        }

        const currUser = this.props.user;
        const character = currUser.gameInfo.character;

        if (!character) {
            return false;
        }

        return character.isGood;
    }

    getInfomation() {
        if (!this.props.user || !this.props.users) {
            return '';
        }

        const currUser = this.props.user;
        const character = currUser.gameInfo.character;
        if (!character) {
            return '';
        }

        if (character.name === 'Loyal Servant' || character.name === 'Oberon') {
            return '';
        }

        let userInfo = [];

        if (character.name === 'Merlin') {
            userInfo.push('You know evils:');
            this.props.users.forEach(userObj => {
                const userCharacter = userObj.gameInfo.character;
                if (!userCharacter || userCharacter.name === character.name) {
                    return;
                }

                if (!userCharacter.isGood && userCharacter.name !== 'Mordred') {
                    userInfo.push(<ColorLabel text={ userObj.userName } colorHex={ userObj.color } />);
                }
            });
        }
        else if (character.name === 'Percival') {
            userInfo.push('You know Merlin:');
            this.props.users.forEach(userObj => {
                const userCharacter = userObj.gameInfo.character;
                if (!userCharacter || userCharacter.name === character.name) {
                    return;
                }

                if (userCharacter.name === 'Morgana' || userCharacter.name === 'Merlin') {
                    userInfo.push(<ColorLabel text={ userObj.userName } colorHex={ userObj.color } />);
                }

                if (userCharacter.name === 'Morgana') {
                    userInfo[0] = 'You know Merlin and Morgana:';
                }
            });
        }
        else if (!character.isGood) {
            userInfo.push('You know other evils:');
            this.props.users.forEach(userObj => {
                const userCharacter = userObj.gameInfo.character;
                if (!userCharacter || userCharacter.name === character.name) {
                    return;
                }

                if (!userCharacter.isGood && userCharacter.name !== 'Oberon') {
                    userInfo.push(<ColorLabel text={ userObj.userName } colorHex={ userObj.color } />);
                }
            });
        }

        return userInfo.map((infoText, i) =>
            <div className='character-card--infomation--item' key={ i } >{ infoText }</div>
        );
    }

    toggleCharacter() {
        const currShownStatus = this.state.characterShown;
        this.setState({
            characterShown: !currShownStatus
        });
    }

    render() {
        return (
            <div className='character-card'>
                <div className='character-card--header'>
                    Indentity
                </div>
                <div className='character-card--username'>
                    <ColorLabel text={ this.getUserName() } colorHex={ this.getUserColor() } />
                </div>
                <div className={ this.state.characterShown ? 'character-card--sensitive__show' : 'character-card--sensitive__hide' }>
                    <div className={ 'character-card--character' + ( this.getCharacterNature() ? ' character-card--character__good' : ' character-card--character__evil') }>
                        { this.getCharacterName() }
                    </div>
                    <div className='character-card--infomation'>
                        { this.getInfomation() }
                    </div>
                </div>
                <div className='character-card--actions'>
                    <Button text={ (this.state.characterShown ? 'Hide' : 'Show') } clickHandler={ this.toggleCharacter } />
                </div>
            </div>
        );
    }
}
