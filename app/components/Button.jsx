import React from 'react';
import PropTypes from 'prop-types';
import '../css/button.scss';

export default class Button extends React.Component {
    static get propTypes() {
        return {
            theme: PropTypes.string,
            text: PropTypes.string,
            clickHandler: PropTypes.func,
            isDisabled: PropTypes.bool
        };
    }

    getClassName() {
        const themes = {
            'default': 'btn btn-default',
            'cancel': 'btn btn-cancel',
            'action': 'btn btn-action',
            'negative': 'btn btn-negative',
            'positive': 'btn btn-positive'
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
            <button
                className={ this.getClassName() }
                onClick={ this.props.clickHandler }
                disabled={ this.props.isDisabled }
            >
                { this.props.text }
            </button>
        );
    }
}
