const tokens = require("./modules/tokens.js");
const users = require("./modules/users.js");
const categories = require("./modules/categories.js");
const utils = require("./modules/utils.js");
const startServer = require("./modules/startServer.js");
const config = require("./config");

const server = startServer();

/*
 * Служебное
 */

//Получаем версию API
server.get("/api/version", function(req, res) {
  utils.sendResultOrCode(config.version, 404, res);
});

/*
 * Токены
 */

//Авторизуемся в API
server.post("/api/auth", function(req, res) {
  //Получаем пользователя по присланным данным
  users.getByEmailPassword(req, user => {
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

/*
 * Пользователи
 */

//Получаем одного пользователя по ID
server.get("/api/users/:id", function(req, res) {
  users.getById(req.params.id, user => {
    utils.sendResultOrCode(user, 404, res);
  });
});

//Получаем всех пользователей
server.get("/api/users", function(req, res) {
  users.getAll(users => {
    utils.sendResultOrCode(users, 404, res);
  });
});

//Добавляем пользователя
server.post("/api/users/registration", function(req, res) {
  //Но сначала проверям, что такого email еще нет в базе
  users.getByEmail(req, user => {
    if (!user) {
      users.addUser(req.body, result => {
        utils.sendResultOrCode(result, 400, res);
      });
    } else {
      res.send(409);
      res.end();
    }
  });
});

//Обновляем пользователя по ID
server.put("/api/users/:id", function(req, res) {
  users.updateById(req.params.id, req.body, result => {
    utils.sendResultOrCode(result, 520, res);
  });
});

//Удаляем пользователя
server.del("/api/users/:id", function(req, res) {
  users.deleteById([req.params.id], result => {
    utils.sendResultOrCode(result, 520, res);
  });
});

/*
 * Категории
 */

//Получаем категорию по ID
server.get("/api/categories/:id", function(req, res) {
  categories.getById(req, req.params.id, category => {
    utils.sendResultOrCode(category, 404, res);
  });
});

//Получаем все категории пользователя
server.get("/api/categories", function(req, res) {
  categories.getByUser(req, categories => {
    utils.sendResultOrCode(categories, 404, res);
  });
});

//Добавляем категорию для пользователя
server.post("/api/categories", function(req, res) {
  categories.add(req, result => {
    utils.sendResultOrCode(result, 400, res);
  });
});

//Обновляем категорию по ID
server.put("/api/categories/:id", function(req, res) {
  categories.updateById(req, req.params.id, req.body, result => {
    utils.sendResultOrCode(result, 520, res);
  });
});

//Удаляем категорию пользователя
server.del("/api/categories/:id", function(req, res) {
  categories.deleteById(req, req.params.id, result => {
    utils.sendResultOrCode(result, 520, res);
  });
});
