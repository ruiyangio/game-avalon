import React from 'react';
import PropTypes from 'prop-types';
import Header from '../components/Header.jsx';
import '../css/layout.scss';

export default class Layout extends React.Component {
    static get propTypes() {
        return {
            children: PropTypes.any 
        };
    }

    render() {
        return (
            <div className='main-wrapper'>
                <Header text='Avalon Game'/>
                <main>
                    { this.props.children }
                </main>
            </div>
        );
    }
}
