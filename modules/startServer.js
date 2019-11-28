config = require("../config");
restify = require("restify");

var startServer = () => {
  //Запускаем сервер
  var server = restify.createServer({
    name: config.name,
    version: config.version,
    url: config.hostname
  });

  server.listen(5001, function() {
    console.log("%s listening at %s", server.name, server.url);
  });

  server.use(restify.plugins.acceptParser(server.acceptable));
  server.use(restify.plugins.queryParser());
  server.use(restify.plugins.bodyParser());

  return server;
};

module.exports = startServer;
