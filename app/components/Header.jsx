import React from 'react';
import PropTypes from 'prop-types';
import '../css/header.scss';

export default class Header extends React.Component {
    static get propTypes() {
        return {
            text: PropTypes.string,
            theme: PropTypes.string,
            children: PropTypes.any
        };
    }

    getClassName() {
        const themes = {
            'default' : 'main-header',
            'sub': 'sub-header'
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
            <header className={ this.getClassName() }>
                { this.props.text }
                { this.props.children }
            </header>
        );
    }
}  
