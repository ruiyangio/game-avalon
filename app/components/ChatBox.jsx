import React from 'react';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import * as util from '../util';
import '../css/chatbox.scss';

export default class ChatBox extends React.Component {
    constructor() {
        super();
        this.state = {
            messages: [],
            message: ''
        };

        this.sendMessage = this.sendMessage.bind(this);
        this.messageBoxChange = this.messageBoxChange.bind(this);
        this.messageBoxKeyPress = this.messageBoxKeyPress.bind(this);
    }

    componentDidMount() {
        let currMessages = this.state.messages;

        util.subScribeMessage((message) => {
            currMessages.push(message);
            
            this.setState({
                messages: currMessages
            });
        });
    }

    messageBoxChange(e) {
        this.setState({
            message: e.target.value
        });
    }

    sendMessage() {
        if (!this.state.message) {
            return;
        }
        
        util.sendMessage(this.state.message);
    }

    messageBoxKeyPress(e) {
        if (e.charCode === 13) {
            this.sendMessage();
        }
    }

    render() {
        return (
            <div className='chat-box'>
                <Card title='Chat'>
                    <div className='chat-box-messages'>
                        {
                            this.state.messages.map((message, i) => {
                                if (!message) {
                                    return;
                                }
                                else {
                                    let userMessage = JSON.parse(message);
                                    let messageText = `${userMessage.userName}: ${userMessage.message}`; 

                                    return <div key={ i } style={{ color: userMessage.color }}>{ messageText }</div>;
                                }
                            })
                        }
                    </div>
                    <Input value={ this.state.message } changeHandler={ this.messageBoxChange } keyPressHandler={this.messageBoxKeyPress} />
                    <Button text='Send' clickHandler={ this.sendMessage } />
                </Card>
            </div>
        );
    }
}
