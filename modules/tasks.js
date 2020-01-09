const tokens = require("./tokens.js");
const taskLog = require("./taskLog.js");
const config = require("../config");
const utils = require("./utils.js");

var connection = config.db.get;

//Получаем задачу по ID
var getById = (req, res) => {
  let id = req.params.id;
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "select " +
      " t.id, " +
      " t.user_id, " +
      " t.name, " +
      " t.name_style, " +
      " t.description, " +
      " c.name category_name, " +
      " t.category_id," +
      " ts.name status_name, " +
      " t.status_id" +
      " from tasks t, categories c, task_statuses ts" +
      " where t.category_id = c.id and t.status_id = ts.id and t.id=? and t.user_id =?",
    [id, user.id],
    function(error, results) {
      utils.sendResultOrCode(error, results, res, 404);
    }
  );
};

//Получаем все задачи пользователя
var getByUser = (req, res) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "select " +
      " t.id," +
      " t.user_id," +
      " t.name, " +
      " t.description, " +
      " c.name category_name, " +
      " t.category_id, " +
      " ts.name status_name, " +
      " t.status_id" +
      " from tasks t, categories c, task_statuses ts" +
      " where t.category_id = c.id and t.status_id = ts.id and t.user_id =?",
    [user.id],
    function(error, results) {
      utils.sendResultOrCode(error, results, res, 404);
    }
  );
};

//Получаем все задачи пользователя по дате
var getByDate = (req, res) => {
  let user = tokens.getUserFromHeaders(req);
  let date = req.params.date;

  connection.query(
    //Здесь какая логика. Получаем задачи, который были заведены в указанную дату
    "select *, " +
    "  (select SUM(TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end)) execution_time " +
    "   from task_log tl " +
    "  where tl.task_id = t.id" +
    "  and tl.execution_start < tl.execution_end" +
    "  and DATE_FORMAT(tl.execution_start,'%Y-%m-%d') = ?) execution_time_day," +
    "  (select SUM(TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end)) execution_time " +
    "   from task_log tl " +
    "  where tl.task_id = t.id" +
    "  and tl.execution_start < tl.execution_end" +
    "  and DATE_FORMAT(tl.execution_start,'%Y-%m-%d') <= ?) execution_time_to_day" +
    "  from (" +
    " select t.id," +
    "  t.user_id, " +
    "  t.name, " +
    "  t.name_style, " +
    "  t.description, " +
    "  c.name category_name, " +
    "  t.category_id, " +
    "  ts.name status_name, " +
    "  t.status_id" +
    " from tasks t, " +
    "  categories c, " +
    "  task_statuses ts" +
    " where t.category_id = c.id " +
    "   and t.status_id = ts.id " +
    "   and DATE_FORMAT(t.create_date,'%Y-%m-%d') = ? " +
    "   and t.user_id =? " +
    //Потом получаем задачи, у которых тип статуса не «завершено» или которые были обновлены в этот день
    " union  " +
    " select t.id, " +
    "  t.user_id, " +
    "  t.name, " +
    "  t.name_style, " +
    "  t.description, " +
    "  c.name category_name, " +
    "  t.category_id, " +
    "  ts.name status_name, " +
    "  t.status_id" +
    " from tasks t, " +
    "  categories c, " +
    "  task_statuses ts" +
    " where t.category_id = c.id " +
    "   and t.status_id = ts.id " +
    "   and DATE_FORMAT(t.create_date,'%Y-%m-%d') <= ? " +
    "   and t.user_id = ?" +
    "   and (ts.type_id !=2 or DATE_FORMAT(t.update_date,'%Y-%m-%d') = ?)  " + //Не завершено
      //И все задачи, по которым были записи в этот день
      " union " +
      " select t.id, " +
      " t.user_id, " +
      " t.name, " +
      " t.name_style, " +
      " t.description, " +
      " c.name category_name, " +
      " t.category_id, " +
      " ts.name status_name, " +
      " t.status_id" +
      " from tasks t, " +
      " categories c, " +
      " task_statuses ts" +
      " where t.category_id = c.id " +
      " and t.status_id = ts.id " +
      " and DATE_FORMAT(t.create_date,'%Y-%m-%d') <= ? " +
      " and t.user_id = ?" +
      //Уот здесь как раз чекаем наличие записей
      " and exists (select * from task_log tl" +
      "              where tl.task_id = t.id" +
      "                and DATE_FORMAT(tl.execution_start,'%Y-%m-%d') = ?" +
      "              limit 1)" +
      " ) t" +
      "  order by 1 asc", //Сортируем по ID
    [date, date, date, user.id, date, user.id, date, date, user.id, date],

    //Преобразуем стили в объект
    function(error, results) {
      let result = results.map(item => {
        item.name_style = JSON.parse(item.name_style);

        return item;
      });

      utils.sendResultOrCode(error, result, res, 404);
    }
  );
};

//Добавляем задачу
var add = (req, res) => {
  let user = tokens.getUserFromHeaders(req);

  //Соберем таску
  let task = {};
  Object.assign(task, { user_id: user.id }, req.body);

  connection.query("insert into tasks set ?", task, function(error, results) {
    utils.sendResultOrCode(error, results, res, 400);
  });
};

//Обновляем задачу по ID
var updateById = (req, res) => {
  let task = req.body;
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "update tasks set category_id=?, status_id=?, name=?, name_style=?, description=?, update_date =? where id=? and user_id =?",
    [
      task.category_id,
      task.status_id,
      task.name,
      JSON.stringify(task.name_style),
      task.description,
      utils.getCurrentDateTime(),
      task.id,
      user.id
    ],
    function(error, results) {
      utils.sendResultOrCode(error, results, res, 520);
    }
  );
};

//Удаляем задачу по ID
var deleteById = (req, res) => {
  let id = req.params.id;
  let user = tokens.getUserFromHeaders(req);

  taskLog.deleteByTaskId(id, success => {
    if (success) {
      connection.query(
        "delete from tasks where id=? and user_id=?",
        [id, user.id],
        function(error, results) {
          utils.sendResultOrCode(error, results, res, 520);
        }
      );
    } else {
      res.send(409);
      res.end();
    }
  });
};

module.exports.getById = getById;
module.exports.getByDate = getByDate;
module.exports.getByUser = getByUser;
module.exports.add = add;
module.exports.updateById = updateById;
module.exports.deleteById = deleteById;
