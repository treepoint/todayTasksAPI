const tokens = require("./tokens.js");
const taskLog = require("./taskLog.js");
const config = require("../config");

var connection = config.db.get;

//Получаем задачу по ID
var getById = (req, taskId, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "select t.id, t.user_id, t.name, t.description, c.name category_name, t.category_id, ts.name status_name, t.status_id" +
      " from tasks t, categories c, task_statuses ts" +
      " where t.category_id = c.id and t.status_id = ts.id and t.id=? and t.user_id =?",
    [taskId, user.id],
    function(error, results) {
      if (error) throw error;
      try {
        callback(results);
      } catch {
        callback(null);
      }
    }
  );
};

//Получаем все задачи пользователя
var getByUser = (req, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "select t.id, t.user_id, t.name, t.description, c.name category_name, t.category_id, ts.name status_name, t.status_id" +
      " from tasks t, categories c, task_statuses ts" +
      " where t.category_id = c.id and t.status_id = ts.id and t.user_id =?",
    [user.id],
    function(error, results) {
      if (error) throw error;
      try {
        callback(results);
      } catch {
        callback(null);
      }
    }
  );
};

//Получаем все задачи пользователя по дате
var getByDate = (req, date, callback) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    //Здесь какая логика. Получаем задачи, который были заведены в указанную дату
    "select *, " +
    "  (select SUM(TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end)) execution_time " +
    "   from task_log tl " +
    "  where tl.task_id = t.id" +
    "  and DATE_FORMAT(tl.execution_start,'%Y-%m-%d') = ?) execution_time" +
    "  from (" +
    " select t.id," +
    "  t.user_id, " +
    "  t.name, " +
    "  t.description, " +
    "  c.name category_name, " +
    "  t.category_id, " +
    "  ts.name status_name, " +
    "  t.status_id" +
    " from tasks t, " +
    "  categories c, " +
    "  task_statuses ts" +
    " where t.category_id = c.id " +
    "   and t.status_id = ts.id " +
    "   and DATE_FORMAT(t.create_date,'%Y-%m-%d') = ? " +
    "   and t.user_id =? " +
    //Потом получаем задачи, у которых тип статуса не «завершено»
    " union  " +
    " select t.id, " +
    "  t.user_id, " +
    "  t.name, " +
    "  t.description, " +
    "  c.name category_name, " +
    "  t.category_id, " +
    "  ts.name status_name, " +
    "  t.status_id" +
    " from tasks t, " +
    "  categories c, " +
    "  task_statuses ts" +
    " where t.category_id = c.id " +
    "   and t.status_id = ts.id " +
    "   and DATE_FORMAT(t.create_date,'%Y-%m-%d') <= ? " +
    "   and t.user_id = ?" +
    "   and ts.type_id !=2" + //Не завершено
      //И все задачи, по которым были записи в этот день
      " union " +
      " select t.id, " +
      " t.user_id, " +
      " t.name, " +
      " t.description, " +
      " c.name category_name, " +
      " t.category_id, " +
      " ts.name status_name, " +
      " t.status_id" +
      " from tasks t, " +
      " categories c, " +
      " task_statuses ts" +
      " where t.category_id = c.id " +
      " and t.status_id = ts.id " +
      " and DATE_FORMAT(t.create_date,'%Y-%m-%d') <= ? " +
      " and t.user_id = ?" +
      //Уот здесь как раз чекаем наличие записей
      " and exists (select * from task_log tl" +
      "              where tl.task_id = t.id" +
      "                and DATE_FORMAT(tl.execution_start,'%Y-%m-%d') = ?" +
      "              limit 1)" +
      " ) t" +
      "  order by 1", //Сортируем по ID
    [date, date, user.id, date, user.id, date, user.id, date],
    function(error, results) {
      if (error) throw error;
      try {
        callback(results);
      } catch {
        callback(null);
      }
    }
  );
};

//Добавляем задачу
var add = (req, callback) => {
  let task = {};
  let user = tokens.getUserFromHeaders(req);

  Object.assign(task, { user_id: user.id }, req.body);

  connection.query("INSERT INTO tasks SET ?", task, function(error, results) {
    if (error) throw error;
    try {
      callback(results);
    } catch {
      callback(error);
    }
  });
};

//Обновляем задачу по ID
var updateById = (req, task, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "UPDATE tasks SET `category_id`=?, `status_id`=?, `name`=?, `description`=? Where id=? and user_id =?",
    [
      task.category_id,
      task.status_id,
      task.name,
      task.description,
      task.id,
      user.id
    ],
    function(error, results) {
      if (error) throw error;
      try {
        callback(results);
      } catch {
        callback(error);
      }
    }
  );
};

//Удаляем задачу по ID
var deleteById = (req, taskId, callback) => {
  let user = tokens.getUserFromHeaders(req);

  taskLog.deleteByTaskId(taskId, success => {
    if (success) {
      connection.query(
        "DELETE FROM tasks WHERE id=? and user_id=?",
        [taskId, user.id],
        function(error) {
          if (error) throw error;
          try {
            callback("{success}");
          } catch {
            callback("{error}");
          }
        }
      );
    } else {
      res.send(409);
      res.end();
    }
  });
};

module.exports.getById = getById;
module.exports.getByDate = getByDate;
module.exports.getByUser = getByUser;
module.exports.add = add;
module.exports.updateById = updateById;
module.exports.deleteById = deleteById;
