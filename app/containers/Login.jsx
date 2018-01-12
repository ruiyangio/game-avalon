import React from 'react';
import PropTypes from 'prop-types';
import Button from '../components/Button.jsx';
import Label from '../components/Label.jsx';
import Input from '../components/Input.jsx';
import * as util from '../util';
import '../css/login.scss';
import '../css/layout.scss';

export default class Login extends React.Component {
    static get propTypes() {
        return {
            history: PropTypes.any,
            'history.push': PropTypes.func
        };
    }

    constructor() {
        super();
        this.state = {
            userName: '',
            alertText: ''
        };

        this.handleUserNameChange = this.handleUserNameChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLoginKeyPress = this.handleLoginKeyPress.bind(this);
    }

    handleUserNameChange(e) {
        this.setState({
            userName: e.target.value,
            alertText: ''
        });
    }

    handleLogin() {
        const userName = this.state.userName;

        if (!userName) {
            this.setState({
                alertText: 'Username should not be empty'
            });
            return;
        }

        if (userName.length >= 12) {
            this.setState({
                alertText: 'Username should be less than 12 characters'
            });
            return;
        }

        util.postRequest('/api/login', { userName: userName }, false)
            .then(res => {
                if (!res.userResolved) {
                    this.setState({
                        alertText: res.error
                    });
                }
                else {
                    util.setToken(res.token);
                    util.sendNewUserJoined();
                    this.props.history.push('/lobby');
                }
            });
    }

    handleLoginKeyPress(e) {
        if (e.charCode === 13) {
            this.handleLogin();
        }
    }

    render() {
        return (
            <div className='login'>
                <div className='login-box'>
                    <div className='spacer'>
                        <Label text={ this.state.alertText } theme='error' />
                    </div>
                    <div className='spacer'>
                        <Label text='Username:' />
                        <Input value={ this.state.userName } changeHandler={ this.handleUserNameChange } keyPressHandler={ this.handleLoginKeyPress } />
                    </div>
                    <div className='spacer'>
                        <Button text='Join' clickHandler={ this.handleLogin } />
                    </div>
                </div>
            </div>
        );
    }
}

