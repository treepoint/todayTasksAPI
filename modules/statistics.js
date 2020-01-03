const tokens = require("./tokens.js");
const utils = require("./utils.js");
const config = require("../config");

var connection = config.db.get;

//Получаем время исполнения задач по конкретному периоду
var getTasksExecutionTimeByPeriod = (req, res) => {
  let dateFrom = req.params.dateFrom;
  let dateTo = req.params.dateTo;

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
      utils.sendResultOrCode(error, results, res, 404);
    }
  );
};

//Получаем время исполнения по категориям
var getCategoriesExecutionTimeForAll = (req, res) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "select category_name name, SUM(execution_time) execution_time  from" +
      " (select c.name category_name, " +
      "         TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end) execution_time" +
      " from task_log tl," +
      " tasks t," +
      " categories c" +
      " where tl.task_id = t.id" +
      " and c.id = t.category_id" +
      " and t.user_id = ?" +
      " ) t" +
      " where t.execution_time >= 0" +
      " group by 1",
    [user.id],
    function(error, results) {
      utils.sendResultOrCode(error, results, res, 404);
    }
  );
};

module.exports.getTasksExecutionTimeByPeriod = getTasksExecutionTimeByPeriod;
module.exports.getCategoriesExecutionTimeForAll = getCategoriesExecutionTimeForAll;
