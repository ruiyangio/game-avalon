const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const debug = require('debug');
const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const Server = require('http').Server;

const routers = require('./server/router');
const serverConfig = require('./config');
const webpackConfig = require('./webpack.config');
const authMiddleware = require('./server/middlewares/auth-middleware');
const socketAuthMiddleware = require('./server/middlewares/socket-auth-middleware');

const app = express();
const server = Server(app);
const sio = require("socket.io")(server);
const webpackCompiler = webpack(webpackConfig);
const socketService = require('./server/service/socket-service')(sio);

// Set Webpack comipler
if (process.env.NODE_ENV !== 'production') {
    app.use(webpackDevMiddleware(webpackCompiler));
    app.use(webpackHotMiddleware(webpackCompiler));
}

// Server Settings
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use(authMiddleware);

// APIs
app.use(routers);

// Socket
sio.use(socketAuthMiddleware)
.on('connection', socketService.handlers);

// Bootstrap
app.set('port', process.env.PORT || serverConfig.defaultServerPort);

server.listen(app.get('port'), () => {
    debug('Board game server listening on port ' + server.address().port);
});
