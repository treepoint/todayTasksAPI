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

module.exports.getAll = getAll;
