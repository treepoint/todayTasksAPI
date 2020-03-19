config = require("../config");
restify = require("restify");
const rjwt = require("restify-jwt-community");

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
  server.use(
    restify.plugins.bodyParser({
      maxBodySize: 1024
    })
  );
  console.log;
  server.use(
    rjwt(config.jwt).unless({
      path: [
        "/api/auth",
        "/api/users/registration",
        "/api/version",
        "/api/reauth"
      ]
    })
  );

  return server;
};

module.exports = startServer;
