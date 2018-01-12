import React from 'react';
import PropTypes from 'prop-types';
import ColorLabel from './ColorLabel.jsx';
import '../css/playercard.scss';

export default class PlayerCard extends React.Component {
    static get propTypes() {
        return {
            user: PropTypes.object,
            clickHandler: PropTypes.func
        };
    }

    getStatusClassName() {
        const statusToClassNameSuffix = {
            'Ready': 'positive',
            'Yes': 'positive',
            'Yes.Reviewed': 'positive',
            'Success': 'positive',
            'Good': 'positive',
            'Not Ready': 'negative',
            'No': 'negative',
            'No.Reviewed': 'negative',
            'Fail': 'negative',
            'Evil': 'negative',
            'Review': 'review',
            'Voted': 'review',
            'Leader': 'leader',
            'Giving lady': 'leader',
            'Investigating': 'leader',
            'Investigated': 'review',
            'Reviewed': 'positive',
            'Good.Reviewed': 'positive',
            'Evil.Reviewed': 'negative',
        };

        let className = 'player-card--status';
        const currStatus = this.props.user.gameInfo.status;
        if (statusToClassNameSuffix[currStatus]) {
            className += ` player-card--status__${statusToClassNameSuffix[currStatus]}`;
        }

        return className;
    }

    render() {
        return (
            <div className={ 'player-card' + (this.props.user.gameInfo.selected ? ' player-card__selected' : '')  } onClick={ this.props.clickHandler } >
                <ColorLabel text={ this.props.user.userName } colorHex={ this.props.user.color } isLeader={ this.props.user.gameInfo.leader } />
                <span className={ this.getStatusClassName() }>
                    { this.props.user.gameInfo.status }
                </span>
                <span className='player-card--lady'>
                    { this.props.user.gameInfo.hasLady ? 'Lady of the lake' : '' }
                </span>
            </div>
        );
    }
}
