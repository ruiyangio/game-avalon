import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import * as util from '../util';

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={
            props => {
                const pathName = props.location.pathname;

                if (util.isAuthenticated() === true && pathName !== '/login') {
                    return <Component {...props} />;
                }
                else if (util.isAuthenticated() === true && pathName === '/login') {
                    return <Redirect to='/lobby' />;
                }
                else if (!util.isAuthenticated() && pathName === '/login') {
                    return <Component {...props} />;
                }
                else {
                    return <Redirect to='/login' />;
                }
            }
        }
    />
);

PrivateRoute.propTypes = {
    location: PropTypes.object,
    'location.pathname': PropTypes.string,
    component: PropTypes.any
};

export default PrivateRoute;
