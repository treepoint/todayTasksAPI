const tokens = require("./tokens.js");
const config = require("../config");

var connection = config.db.get;

//Получаем весь лог
var getAll = (req, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "select tl.id, t.name task_name, DATE_FORMAT(tl.execution_start,'%H:%i:%s') execution_start, DATE_FORMAT(tl.execution_end,'%H:%i:%s') execution_end," +
      " TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end) execution_time" +
      " from task_log tl, tasks t where tl.task_id = t.id and t.user_id =?",
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

//Добавляем запись в лог
var add = (req, callback) => {
  let taskLog = req.body;

  connection.query("insert into task_log set ?", taskLog, function(
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

//Удаляем запись в логе по ID
var deleteById = (taskId, callback) => {
  connection.query("delete from task_log where id=?", [taskId], function(
    error
  ) {
    if (error) throw error;
    try {
      callback("{success}");
    } catch {
      callback("{error}");
    }
  });
};

module.exports.getAll = getAll;
module.exports.add = add;
module.exports.deleteById = deleteById;
