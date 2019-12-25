const tokens = require("./tokens.js");
const config = require("../config");

var connection = config.db.get;

//Получаем статус по ID
var getById = (req, statusId, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "select * from task_statuses where id=?",
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
var getAll = callback => {
  connection.query("select * from task_statuses", function(error, results) {
    // if (error) throw error;
    try {
      callback(results);
    } catch {
      callback(error);
    }
  });
};

//Обновляем статус по ID
var updateById = (ID, status, callback) => {
  connection.query(
    "update task_statuses set name=? where id=?",
    [status.name, ID],
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
var add = (status, callback) => {
  connection.query("insert into task_statuses set ?", status, function(
    error,
    results
  ) {
    if (error) throw error;
    try {
      callback(results);
    } catch {
      callback(error);
    }
  });
};

//Удаляем пользователя по ID
var deleteById = (statusId, callback) => {
  connection.query("delete from task_statuses where id=?", [statusId], function(
    error
  ) {
    try {
      callback("{success}");
    } catch {
      callback("{error}");
    }
  });
};

module.exports.getById = getById;
module.exports.getAll = getAll;
module.exports.updateById = updateById;
module.exports.add = add;
module.exports.deleteById = deleteById;
