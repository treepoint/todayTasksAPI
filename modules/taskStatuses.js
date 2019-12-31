const tokens = require("./tokens.js");
const config = require("../config");

var connection = config.db.get;

//Получаем статус по ID
var getById = (req, statusId, callback) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "select * from task_statuses where id=? and user_id = ?",
    [statusId, user.id],
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

//Получаем все статусы
var getAll = (req, callback) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "select * from task_statuses where user_id = ?",
    user.id,
    function(error, results) {
      // if (error) throw error;
      try {
        callback(results);
      } catch {
        callback(error);
      }
    }
  );
};

//Обновляем статус по ID
var updateById = (req, ID, status, callback) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "update task_statuses set name=? where id=? and user_id = ?",
    [status.name, ID, user.id],
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

//Добавляем статус
var add = (req, status, callback) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "insert into task_statuses set ?",
    { name: status.name, user_id: user.id },
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

//Удаляем пользователя по ID
var deleteById = (req, statusId, callback) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "delete from task_statuses where id=? and user_id = ?",
    [statusId, user.id],
    function() {
      try {
        callback("{success}");
      } catch {
        callback("{error}");
      }
    }
  );
};

module.exports.getById = getById;
module.exports.getAll = getAll;
module.exports.updateById = updateById;
module.exports.add = add;
module.exports.deleteById = deleteById;
