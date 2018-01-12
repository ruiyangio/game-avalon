import React from 'react';
import PropTypes from 'prop-types';
import '../css/label.scss';

export default class Label extends React.Component {
    static get propTypes() {
        return {
            text: PropTypes.string,
            theme: PropTypes.string
        };
    }

    getClassName() {
        const themes = {
            'default' : 'label',
            'error': 'label label-error'
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
            <span className={ this.getClassName() }>{ this.props.text }</span>
        );
    }
}
