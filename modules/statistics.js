const tokens = require("./tokens.js");
const config = require("../config");

var connection = config.db.get;

//Получаем время исполнения задач по конкретному периоду
var getTasksExecutionTimeByPeriod = (req, dateFrom, dateTo, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "select" +
      " t.name," +
      " SUM(TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end)) execution_time" +
      " from task_log tl, tasks t" +
      " where tl.task_id = t.id" +
      "   and t.user_id = ?" +
      "   and DATE_FORMAT(tl.execution_start,'%Y-%m-%d') BETWEEN ? and ?" +
      "   and tl.execution_start < tl.execution_end" +
      " group by t.id, t.name ",
    [user.id, dateFrom, dateTo],
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

module.exports.getTasksExecutionTimeByPeriod = getTasksExecutionTimeByPeriod;
