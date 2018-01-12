import React from 'react';
import PropTypes from 'prop-types';
import '../css/questboard.scss';

export default class QuestBoard extends React.Component {
    static get propTypes() {
        return {
            gameInfo: PropTypes.object,
            clickHandler: PropTypes.func
        };
    }

    getCircleClassName(quest) {
        let className = 'quest-circle';
        if (quest.selected) {
            className += ' quest-circle__selected';
        }

        if (quest.status === 'Success') {
            className += ' quest-circle__success';
        }
        else if (quest.status === 'Failed') {
            className += ' quest-circle__failed';
        }
        return className;
    }

    getFailsText(quest) {
        if (quest.status === 'Failed') {
            return `${quest.fails} Failed`;
        }
        else if (quest.status === 'Success') {
            if (quest.fails > 0) {
                return `${quest.fails} Failed`;
            }
        }
        else if (quest.needsTwoFails) {
            return '2 Fails';
        }
    }

    render() {
        return (
            <div className='quest-board'>
                {
                    this.props.gameInfo.quests.map((quest, i) => 
                        <div
                            className={ this.getCircleClassName(quest) }
                            onClick={ () => this.props.clickHandler(quest) }
                            key={ i }
                        >
                            <span className='quest-circle--number'>{ `Quest ${i + 1}` }</span>
                            <span className='quest-circle--players'>{ quest.playerNumber }</span>
                            {
                                (quest.needsTwoFails || quest.status === 'Failed' || (quest.status === 'Success' && quest.fails > 0)) &&
                                <span className={ (quest.status === 'Failed' || quest.status === 'Success') ? 'quest-circle--failed-text' : 'quest-circle--requirement'}>
                                    { this.getFailsText(quest) }
                                </span>
                            }
                        </div>
                    )   
                }
            </div>
        );
    }
}
