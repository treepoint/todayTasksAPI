const users = require("./modules/users.js");
const tokens = require("./modules/tokens.js");
const utils = require("./modules/utils.js");
const startServer = require("./modules/startServer.js");
const config = require("./config");

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
server.post("/api/users/registration", function(req, res) {
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

//Авторизуемся в API
server.post("/api/auth", function(req, res) {
  //Получаем пользователя по присланным данным
  users.getUserByEmailPassword(req, user => {
    if (!user) {
      res.send(404);
      res.end();
    } else {
      //Если получили — создаем токен
      tokens.createTokens(user, (token, refreshToken) => {
        //Если создали — отправим клиенту
        utils.sendResultOrCode({ token, refreshToken, user }, 400, res);
      });
    }
  });
});

//Обновляем авторизацию в API
server.post("/api/reauth", function(req, res) {
  tokens.refreshTokens(req.body.refreshToken, (token, refreshToken, user) => {
    //Если создали — отправим клиенту
    if (token && refreshToken && user) {
      res.send({ token, refreshToken, user });
    } else {
      res.send(404);
      res.end();
    }
  });
});

//Получаем всех пользователей
server.get("/api/version", function(req, res) {
  utils.sendResultOrCode(config.version, 404, res);
});
