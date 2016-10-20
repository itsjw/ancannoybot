var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    i18n = require("i18n");
Recaptcha = require('recaptcha').Recaptcha;

var routes = require('./routes/index');
var PUBLIC_KEY  = '6LefrAkUAAAAAE_gNKzRC64ntSvjXtVTBGq8LitM',
    PRIVATE_KEY = '6LefrAkUAAAAAA2iVhYTkDGIHJsa01PYRkrb3ugX';
var app = express();

i18n.configure({
    defaultLocale: "en",
    directory: __dirname + '/locales',
    autoReload: true
});

i18n.setLocale(config.locale);

// default: using 'accept-language' header to guess language settings
app.use(i18n.init);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.get('/', function(req, res) {
    var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY);

    res.render('index.jade', {
        layout: false,
        locals: {
            recaptcha_form: recaptcha.toHTML()
        }
    });
});

app.post('/', function(req, res) {
    var data = {
        remoteip:  req.connection.remoteAddress,
        challenge: req.body.recaptcha_challenge_field,
        response:  req.body.recaptcha_response_field
    };
    var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY, data);

    recaptcha.verify(function(success, error_code) {
        if (success) {
            res.send('Recaptcha response valid.');
        }
        else {
            // Redisplay the form.
            res.render('index.jade', {
                layout: false,
                locals: {
                    recaptcha_form: recaptcha.toHTML()
                }
            });
        }
    });
});

app.listen(3000);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
