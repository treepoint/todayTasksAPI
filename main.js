users = require("./modules/users.js");
tokens = require("./modules/tokens.js");
utils = require("./modules/utils.js");
startServer = require("./modules/startServer.js");

const server = startServer();

//Получаем одного пользователя по ID
server.get("/api/users/:id", function(req, res) {
  users.getUserById(req.params.id, user => {
    utils.sendResultOrCode(user, 404, res);
  });
});

//Получаем всех пользователей
server.get("/api/users", function(req, res) {
  users.getUsers(users => {
    utils.sendResultOrCode(users, 404, res);
  });
});

//Добавляем пользователя
server.post("/api/users", function(req, res) {
  users.addUser(req.body, result => {
    utils.sendResultOrCode(result, 400, res);
  });
});

//Обновляем пользователя по ID
server.put("/api/users/:id", function(req, res) {
  users.updateUserById(req.params.id, req.body, result => {
    utils.sendResultOrCode(result, 520, res);
  });
});

//Удаляем пользователя
server.del("/api/users/:id", function(req, res) {
  users.deleteUser([req.params.id], result => {
    utils.sendResultOrCode(result, 520, res);
  });
});

/*
 * Методы работы с токенами
 */

//Создаем токен
server.post("/api/tokens", function(req, res) {
  users.getUserByEmailPassword(req, user => {
    if (!user) {
      res.send(404);
      res.end();
    } else {
      tokens.createToken(req, user.id, token => {
        utils.sendResultOrCode({ token: token, user: user }, 400, res);
      });
    }
  });
});

//Получем токен по ID
server.get("/api/tokens/:id", function(req, res) {
  tokens.getTokenById(req.params.id, token => {
    utils.sendResultOrCode(token, 404, res);
  });
});
