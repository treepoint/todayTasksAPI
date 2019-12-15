const tokens = require("./tokens.js");
const config = require("../config");

var connection = config.db.get;

//Получаем категорию по ID
var getById = (req, taskId, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "select * from tasks where id=? and user_id =?",
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

//Получаем все категории пользователя
var getByUser = (req, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "select t.id, t.user_id, t.name, t.description, c.name category_name" +
      " from tasks t, categories c" +
      " where t.category_id = c.id and t.user_id =?",
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

//Добавляем категорию
var add = (req, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "INSERT INTO tasks SET ?",
    [
      user.id,
      req.body.task.category_id,
      req.body.task.name,
      req.body.task.description
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

//Обновляем пользователя по ID
var updateById = (req, task, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "UPDATE tasks SET `user_id`=?,`category_id`=?, `name`=?, `description`=? Where id=? and user_id =?",
    [
      task.user_id,
      task.category_id,
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

//Удаляем категорию по ID
var deleteById = (req, taskId, callback) => {
  let user = tokens.getUserFromHeaders(req);
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
};

module.exports.getById = getById;
module.exports.getByUser = getByUser;
module.exports.add = add;
module.exports.updateById = updateById;
module.exports.deleteById = deleteById;
