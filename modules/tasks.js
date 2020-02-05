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
      " t.status_id, " +
      " t.in_archive, " +
      " t.on_fire, " +
      " null execution_time_day, " +
      " null execution_time_to_day " +
      " from tasks t, categories c, task_statuses ts" +
      " where t.category_id = c.id and t.status_id = ts.id and t.id=? and t.user_id =?",
    [id, user.id],
    function(error, results) {
      let result = results.map(item => {
        item.name_style = JSON.parse(item.name_style);

        return item;
      });

      utils.sendResultOrCode(error, utils.arrayToIdObject(result), res, 404);
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
      "  t.name_style, " +
      "  t.description, " +
      "  c.name category_name, " +
      "  t.category_id, " +
      "  ts.name status_name, " +
      "  t.status_id," +
      "  t.in_archive," +
      "  t.on_fire," +
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
      "  categories c, " +
      "  task_statuses ts" +
      " where t.category_id = c.id " +
      " and t.status_id = ts.id " +
      //Получаем задачи, который были заведены в указанную дату
      " and (DATE_FORMAT(t.create_date,'%Y-%m-%d') <= ?) " +
      //Или все еще не завершены или были обновлены в указанный день
      " and ((ts.type_id !=2 or DATE_FORMAT(t.update_date,'%Y-%m-%d') = ?) or " +
      //Или по ним были записи в этот день
      "  exists (select * " +
      "            from task_log tl" +
      "   where tl.task_id = t.id" +
      "             and DATE_FORMAT(tl.execution_start,'%Y-%m-%d') = ?" +
      "  limit 1))" +
      " and t.user_id = ? " +
      " order by 1 asc", //Сортируем по ID
    [date, date, date, date, date, date, user.id],

    //Преобразуем стили в объект
    function(error, results) {
      let result = results.map(item => {
        item.name_style = JSON.parse(item.name_style);

        return item;
      });

      utils.sendResultOrCode(error, utils.arrayToIdObject(result), res, 404);
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
    //Если добавили — получим этот объект и вернем уже его
    if (typeof results.insertId === "number") {
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
          " t.status_id, " +
          " t.in_archive, " +
          " t.on_fire, " +
          " ? for_date, " +
          " null execution_time_day, " +
          " null execution_time_to_day " +
          " from tasks t, categories c, task_statuses ts" +
          " where t.category_id = c.id and t.status_id = ts.id and t.id=? and t.user_id =?",
        [task.create_date, results.insertId, user.id],
        function(error, results) {
          //Преобразуем стили в объект
          let result = results.map(item => {
            item.name_style = JSON.parse(item.name_style);

            return item;
          });
          //Если получилось — вернем результат или код ошибки
          utils.sendResultOrCode(
            error,
            utils.arrayToIdObject(result),
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
      " status_id=?, " +
      " name=?, " +
      " name_style=?, " +
      " description=?, " +
      " update_date =?, " +
      " in_archive =?, " +
      " on_fire =? " +
      "where id=? " +
      "  and user_id =?",
    [
      task.category_id,
      task.status_id,
      task.name,
      JSON.stringify(task.name_style),
      task.description,
      task.update_date,
      task.in_archive,
      task.on_fire,
      task.id,
      user.id
    ],
    function(error, results) {
      //Если обновили — получим этот объект и вернем уже его
      if (typeof results.affectedRows === "number") {
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
            " t.status_id, " +
            " t.in_archive, " +
            " t.on_fire, " +
            " null execution_time_day, " +
            " null execution_time_to_day " +
            " from tasks t, categories c, task_statuses ts" +
            " where t.category_id = c.id and t.status_id = ts.id and t.id=? and t.user_id =?",
          [task.id, user.id],
          function(error, results) {
            //Преобразуем стили в объект
            let result = results.map(item => {
              item.name_style = JSON.parse(item.name_style);

              return item;
            });
            //Если получилось — вернем результат или код ошибки
            utils.sendResultOrCode(
              error,
              utils.arrayToIdObject(result),
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
module.exports.add = add;
module.exports.updateById = updateById;
module.exports.deleteById = deleteById;
