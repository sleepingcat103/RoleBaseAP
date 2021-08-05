const express = require('express');
const session = require('express-session');
const engine = require('ejs-locals');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const config = require('./config/configRouter');
const sqlConfig = require("./config/sqlConfig");
const path = require('path');
const rfs = require('rotating-file-stream');
const logger = require('morgan');
const helmet = require('helmet');

// log web log
if (config.logManagement.doLogHTTP) {
    const morgan = require('morgan')
    const accessLogStream = rfs.createStream('access.log', {
        interval: '1d', // rotate daily
        path: path.join(__dirname , 'Logmanager', 'web')
    })
    app.use(morgan('combined', { stream: accessLogStream }))
}

// 安全性
app.use(
    helmet({
      contentSecurityPolicy: false,
      hsts: {
        maxAge: 31536000,
      }
    })
);
app.disable('x-powered-by');

// use ejs-locals for all ejs templates:
app.engine('ejs', engine);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(config.corsOptions));
app.use(session(config.sessionOption));


app.use('/backend/projects', express.static('projects'));
app.use('/backend/static', express.static('public'));
app.use('/backend/packages', express.static('node_modules'));

// , {
//   setHeaders: (res, path) => {
//     res.setHeader('Cache-control', 'max-age=31536000');
//   }
// }

const backendPagesRouter = require('./routes/backendPages');
app.use('/backend', backendPagesRouter);
const backendApiRouter = require('./routes/backendApi');
app.use('/backendApi', backendApiRouter);

module.exports = app;