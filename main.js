//Модули для работы с ДБ
const users = require("./modules/users.js"),
  roles = require("./modules/roles.js"),
  categories = require("./modules/categories.js"),
  tasks = require("./modules/tasks.js"),
  taskStatuses = require("./modules/taskStatuses.js"),
  taskStatusesTypes = require("./modules/taskStatusesTypes.js"),
  taskLog = require("./modules/taskLog.js"),
  auth = require("./modules/auth.js"),
  statistics = require("./modules/statistics.js");

//Служебные модули
const utils = require("./modules/utils.js"),
  startServer = require("./modules/startServer.js"),
  config = require("./config"),
  server = startServer();

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
  auth.auth(req, res);
});

//Обновляем авторизацию в API
server.post("/api/reauth", function(req, res) {
  auth.reauth(req, res);
});

/*
 * Пользователи
 */

//Получаем одного пользователя по ID
server.get("/api/users/:id", function(req, res) {
  users.getById(req, res);
});

//Получаем всех пользователей
server.get("/api/users", function(req, res) {
  users.getAll(req, res);
});

//Добавляем пользователя
server.post("/api/users/registration", function(req, res) {
  users.add(req, res);
});

//Обновляем пользователя по ID
server.put("/api/users/:id", function(req, res) {
  users.updateById(req, res);
});

//Удаляем пользователя
server.del("/api/users/:id", function(req, res) {
  users.deleteById(req, res);
});

/*
 * Роли
 */

//Получаем все роли пользователей
server.get("/api/roles", function(req, res) {
  roles.getAll(req, res);
});

/*
 * Категории
 */

//Получаем категорию по ID
server.get("/api/categories/:id", function(req, res) {
  categories.getById(req, res);
});

//Получаем все категории пользователя
server.get("/api/categories", function(req, res) {
  categories.getByUser(req, res);
});

//Добавляем категорию для пользователя
server.post("/api/categories", function(req, res) {
  categories.add(req, res);
});

//Обновляем категорию по ID
server.put("/api/categories/:id", function(req, res) {
  categories.updateById(req, res);
});

//Закрываем категорию пользователя
server.del("/api/categories/:id", function(req, res) {
  categories.closeById(req, res);
});

/*
 * Задачи
 */

//Получаем задачу по ID
server.get("/api/tasks/:id", function(req, res) {
  tasks.getById(req, res);
});

//Получаем все задачи пользователя
server.get("/api/tasks", function(req, res) {
  tasks.getByUser(req, res);
});

//Получаем все задачи пользователя за определенную дату
server.get("/api/tasks/date/:date", function(req, res) {
  tasks.getByDate(req, res);
});

//Добавляем задачу для пользователя
server.post("/api/tasks", function(req, res) {
  tasks.add(req, res);
});

//Обновляем задачу по ID
server.put("/api/tasks/:id", function(req, res) {
  tasks.updateById(req, res);
});

//Удаляем задачу пользователя
server.del("/api/tasks/:id", function(req, res) {
  tasks.deleteById(req, res);
});

/*
 * Статусы задач
 */

//Получаем статус по ID
server.get("/api/task_statuses/:id", function(req, res) {
  taskStatuses.getById(req, res);
});

//Получаем все статусы
server.get("/api/task_statuses", function(req, res) {
  taskStatuses.getAll(req, res);
});

//Добавляем статус
server.post("/api/task_statuses", function(req, res) {
  taskStatuses.add(req, res);
});

//Обновляем статус по ID
server.put("/api/task_statuses/:id", function(req, res) {
  taskStatuses.updateById(req, res);
});

//Закрываем статус
server.del("/api/task_statuses/:id", function(req, res) {
  taskStatuses.closeById(req, res);
});

/*
 * Типы статусов задач
 */

//Получаем все статусы задач
server.get("/api/task_statuses_types", function(req, res) {
  taskStatusesTypes.getAll(req, res);
});

/*
 * Лог выполнения задач
 */

//Получаем весь лог
server.get("/api/tasks_log", function(req, res) {
  taskLog.getAll(req, res);
});

//Получаем весь лог за определенную дату
server.get("/api/tasks_log/date/:date", function(req, res) {
  taskLog.getByDate(req, res);
});

//Добавляем лог
server.post("/api/tasks_log", function(req, res) {
  taskLog.add(req, res);
});

//Обновляем лог по ID
server.put("/api/tasks_log/:id", function(req, res) {
  taskLog.updateById(req, res);
});

//Удаляем лог
server.del("/api/tasks_log/:id", function(req, res) {
  taskLog.deleteById(req, res);
});

/*
 * Статистика
 */

//Получаем время исполнения по всем категориям
server.get("/api/categories/time_execution/all", function(req, res) {
  statistics.getCategoriesExecutionTimeForAll(req, res);
});

//Получаем время исполнения задач по конкретному периоду
server.get("/api/tasks/statistic/period/:dateFrom/:dateTo", function(req, res) {
  statistics.getTasksExecutionTimeByPeriod(req, res);
});
