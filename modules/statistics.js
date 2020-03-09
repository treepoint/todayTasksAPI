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
      " c.name category_name," +
      " c.name_style category_name_style," +
      " SUM(TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end)) execution_time" +
      " from task_log tl, tasks t, categories c" +
      " where tl.task_id = t.id" +
      "   and t.user_id = ?" +
      "   and t.category_id = c.id" +
      "   and DATE_FORMAT(tl.execution_start,'%Y-%m-%d') BETWEEN ? and ?" +
      "   and tl.execution_start < tl.execution_end" +
      " group by t.id, t.name ",
    [user.id, dateFrom, dateTo],
    function(error, results) {
      utils.sendResultOrCode(error, results, res, 404);
    }
  );
};

//Получаем время исполнения задач по категориям по конкретному периоду
var getCategoriesExecutionTimeByPeriod = (req, res) => {
  let dateFrom = req.params.dateFrom;
  let dateTo = req.params.dateTo;

  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "select" +
      " c.name," +
      " c.name_style," +
      " SUM(TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end)) execution_time" +
      " from task_log tl, tasks t, categories c" +
      " where tl.task_id = t.id" +
      " and t.user_id = ?" +
      " and t.category_id = c.id" +
      " and DATE_FORMAT(tl.execution_start,'%Y-%m-%d') BETWEEN ? and ?" +
      " and tl.execution_start < tl.execution_end" +
      " group by c.name",
    [user.id, dateFrom, dateTo],
    function(error, results) {
      //Преобразуем стили в объект
      let result = results.map(item => {
        item.name_style = JSON.parse(item.name_style);

        return item;
      });

      utils.sendResultOrCode(error, result, res, 404);
    }
  );
};

//Получаем время исполнения по категориям
var getCategoriesExecutionTimeForAll = (req, res) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "select name, name_style, SUM(execution_time) execution_time  from" +
      " (select c.name name, " +
      "         c.name_style name_style, " +
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
      //Преобразуем стили в объект
      let result = results.map(item => {
        item.name_style = JSON.parse(item.name_style);

        return item;
      });

      utils.sendResultOrCode(error, result, res, 404);
    }
  );
};

module.exports.getTasksExecutionTimeByPeriod = getTasksExecutionTimeByPeriod;
module.exports.getCategoriesExecutionTimeByPeriod = getCategoriesExecutionTimeByPeriod;
module.exports.getCategoriesExecutionTimeForAll = getCategoriesExecutionTimeForAll;
