
/**
 * Module dependencies.
 */

var express = require('express');
var Canvas = require('canvas');
var io = require('socket.io');

var app = module.exports = express.createServer();
var canvas = new Canvas(16, 16);
var ctx = canvas.getContext('2d');
var stage = {};
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, 16, 16);

// Configuration

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

// Routes

app.get('/', function (req, res) {
    console.log(stage);
    res.render('index', {
        title: 'Favicon colloaborator',
        stage: stage
    });
});
app.get('/favicon', function (req, res) {
    var stream = canvas.createPNGStream();

    res.contentType('image/png');
    stream.on('data', function (chunk) {
        res.write(chunk);
    });
    stream.on('end', function () {
        res.end();
    });
});

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// Socket.IO

io = io.listen(app);
io.sockets.on('connection', function (socket) {
    socket.on('change', function (data) {
        var point = data.id.split('');
        var row = parseInt(point[0], 16);
        var col = parseInt(point[1], 16);
        stage[data.id] = data.color;
        ctx.fillStyle = '#' + data.color;
        ctx.fillRect(col, row, 1, 1);
        socket.broadcast.emit('change', data);
        socket.emit('change');
    });
});
