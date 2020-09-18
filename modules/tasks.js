const tokens = require("./tokens.js");
const taskLog = require("./taskLog.js");
const newUserData = require("./newUserData.js")
const utils = require("./utils.js");
const config = require("../config");

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
    " t.description, " +
    " c.name category_name, " +
    " t.category_id," +
    " t.on_fire, " +
    " t.frozen, " +
    " DATE_FORMAT(t.closed_date,'%Y-%m-%d') closed_date," +
    " DATE_FORMAT(t.moved_date,'%Y-%m-%d') moved_date," +
    " null execution_time_day, " +
    " null execution_time_to_day " +
    " from tasks t, categories c" +
    " where t.category_id = c.id and t.id=? and t.user_id =?",
    [id, user.id],
    function (error, results) {
      utils.sendResultOrCode(error, utils.arrayToIdObject(results), res, 404);
    }
  );
};

//Получаем все задачи пользователя по дате
var getByDate = (req, res) => {
  let user = tokens.getUserFromHeaders(req);
  let date = req.params.date;

  connection.query(
    " select t.id," +
    " t.user_id, " +
    "  t.name, " +
    "  t.description, " +
    "  c.name category_name, " +
    "  t.category_id, " +
    "  t.on_fire," +
    "  t.frozen," +
    "  DATE_FORMAT(t.closed_date,'%Y-%m-%d') closed_date," +
    "  DATE_FORMAT(t.moved_date,'%Y-%m-%d') moved_date," +
    " ? for_date, " +
    " (select SUM(TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end)) execution_time " +
    "  from task_log tl " +
    "  where tl.task_id = t.id" +
    "     and tl.execution_start < tl.execution_end" +
    "    and DATE_FORMAT(tl.execution_start,'%Y-%m-%d') = ?) execution_time_day," +
    "  (select SUM(TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end)) execution_time" +
    "   from task_log tl " +
    "  where tl.task_id = t.id" +
    "    and tl.execution_start < tl.execution_end" +
    "   and DATE_FORMAT(tl.execution_start,'%Y-%m-%d') <= ?) execution_time_to_day" +
    " from  tasks t, " +
    "  categories c " +
    " where t.category_id = c.id " +
    //Получаем задачи, который были заведены в указанную дату
    " and (DATE_FORMAT(t.create_date,'%Y-%m-%d') <= ?) " +
    //Не закрыты или были обновлены в указанный день
    " and ((DATE_FORMAT(t.closed_date,'%Y-%m-%d') is null or DATE_FORMAT(t.closed_date,'%Y-%m-%d') > ? or DATE_FORMAT(t.update_date,'%Y-%m-%d') = ?) or " +
    //Или по ним были записи в этот день
    "  exists (select * " +
    "            from task_log tl" +
    "   where tl.task_id = t.id" +
    "             and DATE_FORMAT(tl.execution_start,'%Y-%m-%d') = ?" +
    "  limit 1))" +
    //Получаем задачи, дата переноса которых равна или меньшее нужной даты. Ну или пустая
    " and (DATE_FORMAT(t.moved_date,'%Y-%m-%d') <= ? or t.moved_date is null) " +
    " and t.user_id = ? " +
    " order by 1 asc", //Сортируем по ID
    [date, date, date, date, date, date, date, date, user.id],
    function (error, results) {
      utils.sendResultOrCode(error, utils.arrayToIdObject(results), res, 404);
    }
  );
};

//Добавляем задачу
var add = (req, res) => {
  let user = tokens.getUserFromHeaders(req);

  //Соберем таску
  let task = {};
  Object.assign(task, { user_id: user.id }, req.body);

  connection.query("insert into tasks set ?", task, function (error, results) {
    //Если добавили — получим этот объект и вернем уже его
    if (typeof results.insertId === "number") {
      connection.query(
        "select " +
        " t.id, " +
        " t.user_id, " +
        " t.name, " +
        " t.description, " +
        " c.name category_name, " +
        " t.category_id," +
        " t.on_fire, " +
        " t.frozen, " +
        " DATE_FORMAT(t.closed_date,'%Y-%m-%d') closed_date," +
        " DATE_FORMAT(t.moved_date,'%Y-%m-%d') moved_date," +
        " ? for_date, " +
        " null execution_time_day, " +
        " null execution_time_to_day " +
        " from tasks t, categories c" +
        " where t.category_id = c.id and t.id=? and t.user_id =?",
        [task.create_date, results.insertId, user.id],
        function (error, results) {
          //Если получилось — вернем результат или код ошибки
          utils.sendResultOrCode(
            error,
            utils.arrayToIdObject(results),
            res,
            400
          );
        }
      );
    } else {
      //Иначе вернем код ошибки
      res.send(400);
      res.end();
    }
  });
};

//Обновляем задачу по ID
var updateById = (req, res) => {
  let task = req.body;
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "update tasks set " +
    " category_id=?, " +
    " name=?, " +
    " description=?, " +
    " closed_date=?, " +
    " update_date=?, " +
    " on_fire=?, " +
    " frozen=?, " +
    " moved_date=? " +
    "where id=? " +
    "  and user_id =?",
    [
      task.category_id,
      task.name,
      task.description,
      task.closed_date,
      task.update_date,
      task.on_fire,
      task.frozen,
      task.moved_date,
      task.id,
      user.id
    ],
    function (error, results) {
      //Если обновили — получим этот объект и вернем уже его
      if (typeof results.affectedRows === "number") {
        connection.query(
          "select " +
          " t.id, " +
          " t.user_id, " +
          " t.name, " +
          " t.description, " +
          " c.name category_name, " +
          " t.category_id," +
          " t.on_fire, " +
          " t.frozen, " +
          " DATE_FORMAT(t.closed_date,'%Y-%m-%d') closed_date," +
          " DATE_FORMAT(t.moved_date,'%Y-%m-%d') moved_date," +
          " null execution_time_day, " +
          " null execution_time_to_day " +
          " from tasks t, categories c" +
          " where t.category_id = c.id and t.id=? and t.user_id =?",
          [task.id, user.id],
          function (error, results) {
            //Если получилось — вернем результат или код ошибки
            utils.sendResultOrCode(
              error,
              utils.arrayToIdObject(results),
              res,
              520
            );
          }
        );
      }
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
        function (error, results) {
          utils.sendResultOrCode(error, results, res, 520);
        }
      );
    } else {
      res.send(409);
      res.end();
    }
  });
};

//Создаем тестовую задачу
var createFirstUserTask = (user_id) => {

  //Получим ID первой, открытой категории пользователя
  connection.query(
    "  select c.id " +
    "  from categories c  " +
    " where (c.close_date is null or exists (select 1 from tasks t where t.category_id = c.id)) " +
    "   and user_id = ?" +
    " limit 1",
    [user_id],
    function (error, result) {

      let category_id = result[0].id;
      let task =
      {
        user_id: user_id,
        category_id: category_id,
        name: newUserData.firstTaskName,
        description: newUserData.firstTaskDescription,
        create_date: utils.getCurrentDate()
      };

      connection.query("insert into tasks set ?", task, function (error, results) { });
    });
}

module.exports.getById = getById;
module.exports.getByDate = getByDate;
module.exports.add = add;
module.exports.updateById = updateById;
module.exports.deleteById = deleteById;
module.exports.createFirstUserTask = createFirstUserTask;
