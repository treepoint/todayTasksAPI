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
    "UPDATE `task_statuses` SET `name`=? Where id=?",
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

module.exports.getById = getById;
module.exports.getAll = getAll;
module.exports.updateById = updateById;
