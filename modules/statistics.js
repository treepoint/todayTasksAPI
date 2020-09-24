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
    " t.project_id," +
    " SUM(TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end)) execution_time" +
    " from task_log tl, tasks t, categories c" +
    " where tl.task_id = t.id" +
    "   and t.user_id = ?" +
    "   and t.category_id = c.id" +
    "   and DATE_FORMAT(tl.execution_start,'%Y-%m-%d') BETWEEN ? and ?" +
    "   and tl.execution_start < tl.execution_end" +
    " group by t.id, t.name ",
    [user.id, dateFrom, dateTo],
    function (error, results) {
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
    " t.project_id," +
    " SUM(TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end)) execution_time" +
    " from task_log tl, tasks t, categories c" +
    " where tl.task_id = t.id" +
    " and t.user_id = ?" +
    " and t.category_id = c.id" +
    " and DATE_FORMAT(tl.execution_start,'%Y-%m-%d') BETWEEN ? and ?" +
    " and tl.execution_start < tl.execution_end" +
    " group by c.name",
    [user.id, dateFrom, dateTo],
    function (error, results) {
      //Преобразуем стили в объект
      let result = results.map((item) => {
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
    "select name, name_style, project_id, SUM(execution_time) execution_time from" +
    " (select c.name name, " +
    "         c.name_style name_style, " +
    "         c.project_id project_id, " +
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
    function (error, results) {
      //Преобразуем стили в объект
      let result = results.map((item) => {
        item.name_style = JSON.parse(item.name_style);

        return item;
      });

      utils.sendResultOrCode(error, result, res, 404);
    }
  );
};

//Получаем суммарно время исполнения задач по конкретному периоду
var getTotalExecutionTimeByPeriod = (req, res) => {
  let dateFrom = req.params.dateFrom;
  let dateTo = req.params.dateTo;

  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "select SUM(execution_time) execution_time, project_id from (" +
    "select" +
    " SUM(TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end)) execution_time, t.project_id" +
    " from task_log tl, tasks t" +
    " where tl.task_id = t.id" +
    "   and t.user_id = ?" +
    "   and DATE_FORMAT(tl.execution_start,'%Y-%m-%d') BETWEEN ? and ?" +
    "   and tl.execution_start < tl.execution_end" +
    " group by t.id, t.name, t.project_id ) t" +
    " group by project_id;",
    [user.id, dateFrom, dateTo],
    function (error, results) {
      utils.sendResultOrCode(error, results, res, 404);
    }
  );
};

//Получаем статистику по времени за дни определенного периода
var getStatisticByDaysForPeriod = (req, res) => {
  let dateFrom = req.params.dateFrom;
  let dateTo = req.params.dateTo;

  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "select " +
    " DATE_FORMAT(tl.execution_start,'%Y-%m-%d') date, SUM(TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end)) execution_time, t.project_id " +
    " from task_log tl, tasks t " +
    " where tl.task_id = t.id " +
    "   and t.user_id = ? " +
    "   and tl.execution_start < tl.execution_end " +
    "	  and DATE_FORMAT(tl.execution_start,'%Y-%m-%d') BETWEEN ? and ? " +
    " group by date, t.project_id " +
    " order by date, t.project_id ",
    [user.id, dateFrom, dateTo],
    function (error, results) {
      utils.sendResultOrCode(error, results, res, 404);
    }
  );
};

//Получаем количество активных задач в разрезе категорий
var getActiveTasksCountByCategories = (req, res) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    " select c.id, " +
    " (select count(1)  " +
    "    from tasks ts " +
    " where ts.category_id = c.id " +
    "   and (ts.closed_date is null or DATE_FORMAT(ts.closed_date,'%Y-%m-%d') > DATE_FORMAT(CURDATE(),'%Y-%m-%d'))) count " +
    "  from categories c " +
    " where c.user_id = ?",
    [user.id],
    function (error, results) {
      utils.sendResultOrCode(error, utils.arrayToIdObject(results), res, 404);
    }
  );
};

//Получаем количество активных задач в разрезе проектов
var getActiveTasksCountByProjects = (req, res) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    " select p.id, " +
    " (select count(1)  " +
    "    from tasks ts " +
    " where ts.project_id = p.id " +
    "   and ts.user_id = ?" +
    "   and (ts.closed_date is null or DATE_FORMAT(ts.closed_date,'%Y-%m-%d') > DATE_FORMAT(CURDATE(),'%Y-%m-%d'))) count " +
    "  from projects p " +
    " where p.user_id = ?",
    [user.id, user.id],
    function (error, results) {
      utils.sendResultOrCode(error, utils.arrayToIdObject(results), res, 404);
    }
  );
};

module.exports.getStatisticByDaysForPeriod = getStatisticByDaysForPeriod;
module.exports.getTasksExecutionTimeByPeriod = getTasksExecutionTimeByPeriod;
module.exports.getCategoriesExecutionTimeByPeriod = getCategoriesExecutionTimeByPeriod;
module.exports.getTotalExecutionTimeByPeriod = getTotalExecutionTimeByPeriod;
module.exports.getCategoriesExecutionTimeForAll = getCategoriesExecutionTimeForAll;
module.exports.getActiveTasksCountByCategories = getActiveTasksCountByCategories;
module.exports.getActiveTasksCountByProjects = getActiveTasksCountByProjects;
