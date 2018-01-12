import React from 'react';
import PropTypes from 'prop-types';
import '../css/colorlabel.scss';

export default class ColorLabel extends React.Component {
    static get propTypes() {
        return {
            text: PropTypes.string,
            colorHex: PropTypes.string,
            isLeader: PropTypes.bool
        };
    }

    getColorStyle() {
        if (this.props.colorHex) {
            return {
                color: this.props.colorHex
            };
        }
    }

    render() {
        return (
            <span className={ 'color-label' + (this.props.isLeader ? ' color-label__leader' : '') } style={ this.getColorStyle() }>{ this.props.text }</span>
        );
    }
}
