import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button.jsx';
import '../css/modal.scss';

export default class Modal extends React.Component {
    static get propTypes() {
        return {
            children: PropTypes.any,
            closeHandler: PropTypes.func.isRequired,
            confirmHandler: PropTypes.func,
            title: PropTypes.string,
            buttonText: PropTypes.string
        };
    }

    render() {
        return (
            <div className='modal'>
                <div className='modal--content'>
                    <div className='modal--title'>
                        <span>{ this.props.title }</span>
                        <i className='fa fa-times modal--close-button' onClick={ this.props.closeHandler } ></i>
                    </div>
                    <div className='modal--body'>
                        { this.props.children }
                        <div className='modal--buttons'>
                            <Button text={ this.props.buttonText } clickHandler={ this.props.confirmHandler }/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
