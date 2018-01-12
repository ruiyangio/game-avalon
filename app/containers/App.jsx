import React from 'react';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import Layout from './Layout.jsx';
import Login from './Login.jsx';
import Main from './Main.jsx';
import PrivateRoute from '../components/PrivateRoute.jsx';

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Layout>
                <Router>
                    <Switch>
                        <PrivateRoute exact path='/login' component={ Login } />
                        <PrivateRoute exact path='/lobby' component={ Main } />
                        <PrivateRoute path='/' component={ Main } />
                    </Switch>
                </Router>
            </Layout>
        );
    }
}  
