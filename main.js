//Модули для работы с ДБ
const tokens = require("./modules/tokens.js");
const users = require("./modules/users.js");
const roles = require("./modules/roles.js");
const categories = require("./modules/categories.js");
const tasks = require("./modules/tasks.js");
const taskStatuses = require("./modules/taskStatuses.js");
const tasksLog = require("./modules/tasksLog.js");

//Служебные модули
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
  users.getById(req.params.id, result => {
    utils.sendResultOrCode(result, 404, res);
  });
});

//Получаем всех пользователей
server.get("/api/users", function(req, res) {
  users.getAll(result => {
    utils.sendResultOrCode(result, 404, res);
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
 * Роли
 */

//Получаем всех пользователей
server.get("/api/roles", function(req, res) {
  roles.getAll(result => {
    utils.sendResultOrCode(result, 404, res);
  });
});

/*
 * Категории
 */

//Получаем категорию по ID
server.get("/api/categories/:id", function(req, res) {
  categories.getById(req, req.params.id, result => {
    utils.sendResultOrCode(result, 404, res);
  });
});

//Получаем все категории пользователя
server.get("/api/categories", function(req, res) {
  categories.getByUser(req, result => {
    utils.sendResultOrCode(result, 404, res);
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

/*
 * Задачи
 */

//Получаем задачу по ID
server.get("/api/tasks/:id", function(req, res) {
  tasks.getById(req, req.params.id, result => {
    utils.sendResultOrCode(result, 404, res);
  });
});

//Получаем все задачи пользователя
server.get("/api/tasks", function(req, res) {
  tasks.getByUser(req, result => {
    utils.sendResultOrCode(result, 404, res);
  });
});

//Добавляем задачу для пользователя
server.post("/api/tasks", function(req, res) {
  tasks.add(req, result => {
    utils.sendResultOrCode(result, 400, res);
  });
});

//Обновляем задачу по ID
server.put("/api/tasks/:id", function(req, res) {
  tasks.updateById(req, req.params.id, req.body, result => {
    utils.sendResultOrCode(result, 520, res);
  });
});

//Удаляем задачу пользователя
server.del("/api/tasks/:id", function(req, res) {
  tasks.deleteById(req, req.params.id, result => {
    utils.sendResultOrCode(result, 520, res);
  });
});

/*
 * Статусы задач
 */

//Получаем статус по ID
server.get("/api/task_statuses/:id", function(req, res) {
  taskStatuses.getById(req, req.params.id, result => {
    utils.sendResultOrCode(result, 404, res);
  });
});

//Получаем все статусы
server.get("/api/task_statuses", function(req, res) {
  taskStatuses.getAll(result => {
    utils.sendResultOrCode(result, 404, res);
  });
});

//Обновляем статус по ID
server.put("/api/task_statuses/:id", function(req, res) {
  taskStatuses.updateById(req.params.id, req.body, result => {
    utils.sendResultOrCode(result, 520, res);
  });
});

/*
 * Лог выполнения задач
 */

//Получаем весь лог
server.get("/api/tasks_log", function(req, res) {
  tasksLog.getAll(req, result => {
    utils.sendResultOrCode(result, 404, res);
  });
});
