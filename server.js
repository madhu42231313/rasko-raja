const express = require('express');
var app = express();
const bodyParser = require('body-parser');
var cors = require('cors');
const config = require('config')
// var mongoose = require('mongoose');
// mongoose.Promise = require('bluebird');

// const db = mongoose.connection

// const options = {
//     auto_reconnect: true,
//     reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
//     reconnectInterval: 500, // Reconnect every 500ms
//     poolSize: 500, // Maintain up to 500 socket connections
//     // If not connected, return errors immediately rather than waiting for reconnect
//     bufferMaxEntries: 0,
//     keepAlive: 120,
//     promiseLibrary: require('bluebird'),
//     useNewUrlParser: true
// };

// // var mongoUrl = "mongodb://localhost:27017/eamcet"

// var mongoUrl ="mongodb://eamcet1313:eamcet1313@ds159184.mlab.com:59184/eamcet";

// db.on('open', function () {
//     console.log('mongoose connected successfully')
// })

// db.once('error', function (err) {
//     console.error('mongoose err', err)
//     mongoose.disconnect()
// })

// db.on('reconnected', function () {
//     console.log('mongoose reconnected')
// })

// db.on('disconnected', function () {
//     console.log('mongoose disconnected')
//     mongoose.connect(mongoUrl, options).then(() => {
//         console.log('mongo connected successfully')
//     }).catch((err) => {
//         console.log('err ', err)
//     })
// })

// mongoose.connect(mongoUrl, options).then(() => {
//     console.log('mongo connected successfully')
// }).catch((err) => {
//     console.log('err ', err)
// })

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}


const port = normalizePort(process.env.PORT || 7788);


app.use(bodyParser.json())
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors(), function (req, res, next) {
    next()
})

app.use(express.static(`${__dirname}/dist/${__dirname}/`))
require('./restapp/routes/mainRoutes')(app)

app.get('*', function (req, res, next) {
    // alert('am here')
    res.sendFile(`${__dirname}/dist/${__dirname}/index.html`)
})

app.listen(port,()=>{
    console.log(`Server listening on ${port}.`)
});

module.exports = app;