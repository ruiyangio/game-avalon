import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button.jsx';
import '../css/actionlabel.scss';

export default class ActionLabel extends React.Component {
    static get propTypes() {
        return {
            labelText: PropTypes.string,
            buttonText: PropTypes.string,
            actionHandler: PropTypes.func
        };
    }

    render() {
        return (
            <div className='action-label'>
                <span>{ this.props.labelText }</span>
                <Button text={ this.props.buttonText } clickHandler={ this.props.actionHandler } theme='action' />
            </div>
        );
    }
}
