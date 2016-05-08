const Hapi = require('hapi');
const request = require('request');
const path = require('path');

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

server.register(require('inert'), (err) => {

  if (err) {
    throw err;
  }

  server.start((err) => {
    if (err) {
      throw err;
    }
    console.log('info', 'Server running at: ' + server.info.uri);
  });
});

server.route({
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      console.log('base route');
      return reply.file('index.html');
    },
});

server.route({
  method: 'POST',
  path: '/login',
  handler: (request, reply) => {
    console.log('form data posted');
    console.log(request.payload);
    return reply('thanks');
  }
});
