const Hapi = require('hapi');
const request = require('request');
const path = require('path');
const moment = require('moment');
const bcrypt = require('bcrypt');

const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: path.join(__dirname, 'app')
      }
    }
  }
});

server.connection({
  port: process.env.PORT || 1337
});

const io = require('socket.io')(server.listener);

io.on('connection', function(socket) {
  log('client <strong>connected</strong>');

  socket.on('client_load', function() {
    log('client <strong>loaded</strong>');
  });

  socket.on('disconnect', function() {
    log('a user <strong>disconnected</strong>');
  });
});

server.register(require('inert'), (err) => {

  if (err) {
    throw err;
  }

  server.start((err) => {
    if (err) {
      throw err;
    }
    log('Server running at: ' + server.info.uri);
  });
});

server.route({
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      log('base route');
      return reply.file('index.html');
    },
});

server.route({
  method: 'POST',
  path: '/login',
  handler: (req, reply) => {
    if (req.payload && bcrypt.compareSync(req.payload.password, process.env.PASSWORD_HASH)) {
      log('successful login');
      reply.file('success.html');

      setTimeout(() => { // YOLO
        log('making request to NFC verification API');
        request({
          uri: 'http://kmoe.herokuapp.com/verify',
          method: 'GET',
          timeout: 20000,
        }, function (error, response, body) {
          if (error) {
            log(error);
          } else if (response.statusCode) {
            log('server returned status code ' + response.statusCode);
            if (response.statusCode == 200) {
              log(body);
            }
          } else {
            log('malformed response');
          }
        });
      }, 2000);

    } else {
      log('unsuccessful login');
      return reply.file('index.html');
    }
  }
});

function log() {
  const message = Array.prototype.slice.call(arguments).join(' ');
  console.log(message);
  if (io) {
    io.emit('log', moment().format('YYYY-MM-DD HH:mm:ss') + ': ' + message);
  }
}