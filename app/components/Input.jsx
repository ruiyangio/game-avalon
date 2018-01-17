import React from 'react';
import PropTypes from 'prop-types';
import '../css/input.scss';

export default class Input extends React.Component {
    static get propTypes() {
        return {
            theme: PropTypes.string,
            value: PropTypes.any,
            changeHandler: PropTypes.func,
            keyPressHandler: PropTypes.func
        };
    }

    getClassName() {
        const themes = {
            'default': 'input-box'
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
            <input
                className = { this.getClassName() }
                value = { this.props.value }
                onChange = { this.props.changeHandler }
                onKeyPress={ this.props.keyPressHandler }
            />
        );
    }
}
