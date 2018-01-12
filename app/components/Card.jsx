import React from 'react';
import PropTypes from 'prop-types';
import '../css/card.scss';

export default class Card extends React.Component {
    static get propTypes() {
        return {
            children: PropTypes.any,
            title: PropTypes.string,
            theme: PropTypes.string
        };
    }

    getContentClassName() {
        const themes = {
            'default': 'card-content',
            'lobby': 'card-content card-content-lobby'
        };

        if (themes[this.props.theme]) {
            return themes[this.props.theme];
        }
        else {
            return themes['default'];
        }
    }

    render() {
        return (
            <div className='card'>
                <div className='card-title'>
                    { this.props.title }
                </div>
                <div className={ this.getContentClassName() }>
                    { this.props.children }
                </div>
            </div>
        );
    }
}
