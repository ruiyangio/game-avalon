import React from 'react';
import PropTypes from 'prop-types';
import * as util from '../util';
import '../css/checkbox.scss';

export default class Checkbox extends React.Component {
    static get propTypes() {
        return {
            theme: PropTypes.string,
            isChecked: PropTypes.bool,
            changeHandler: PropTypes.func,
            labelText: PropTypes.string,
            note: PropTypes.string
        };
    }

    componentWillMount() {
        this.id = util.genId('avalon_1_checkbox_');
    }

    getClassName() {
        const themes = {
            'default': 'check-box'
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
            <label className = { this.getClassName() } htmlFor={ this.id }>
                <input
                    type='checkbox'
                    id={ this.id }
                    checked={ this.props.isChecked }
                    onChange = { this.props.changeHandler }
                    hidden
                />
                <span className='check-box--checkmark'></span>
                <span className='check-box--text'>{ this.props.labelText }</span>
                <span className='check-box--note'>{ this.props.note }</span>
            </label>
        );
    }
}
