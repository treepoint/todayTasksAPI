const tokens = require("./tokens.js");
const config = require("../config");
const utils = require("./utils.js");

var connection = config.db.get;

//Получаем весь лог, который был сделан в нужный день
var getByDate = (req, res) => {
  let date = req.params.date;
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "select " +
      " tl.id, " +
      " tl.task_id, " +
      " t.name task_name," +
      " tl.comment," +
      "? for_date, " +
      " DATE_FORMAT(tl.execution_start,'%H:%i') execution_start, " +
      " DATE_FORMAT(tl.execution_end,'%H:%i') execution_end," +
      " TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end) execution_time" +
      " from task_log tl, tasks t where tl.task_id = t.id and t.user_id =? and DATE_FORMAT(tl.execution_start,'%Y-%m-%d') = ? " +
      " order by tl.id desc",
    [date, user.id, date],
    function(error, results) {
      //Немного конвертируем время. Если время исполнения меньше 0 — проставим 0
      let result = results.map(item => {
        if (item.execution_time < 0) {
          item.execution_time = 0;
        }
        return item;
      });

      utils.sendResultOrCode(error, utils.arrayToObject(result), res, 404);
    }
  );
};

//Добавляем запись в лог
var add = (req, res) => {
  let taskLog = req.body;
  let user = tokens.getUserFromHeaders(req);

  connection.query("insert into task_log set ?", taskLog, function(
    error,
    results
  ) {
    //Если добавили — получим этот объект и вернем уже его
    if (typeof results.insertId === "number") {
      connection.query(
        "select " +
          " tl.id, " +
          " tl.task_id, " +
          " t.name task_name," +
          " tl.comment," +
          "? for_date, " +
          " DATE_FORMAT(tl.execution_start,'%H:%i') execution_start, " +
          " DATE_FORMAT(tl.execution_end,'%H:%i') execution_end," +
          " TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end) execution_time" +
          " from task_log tl, tasks t where tl.task_id = t.id and tl.id =? and t.user_id =? " +
          " order by tl.id desc",
        [taskLog.execution_end, results.insertId, user.id],
        function(error, results) {
          //Немного конвертируем время. Если время исполнения меньше 0 — проставим 0
          let result = results.map(item => {
            if (item.execution_time < 0) {
              item.execution_time = 0;
            }
            return item;
          });

          //Если получилось — вернем результат или код ошибки
          utils.sendResultOrCode(error, utils.arrayToObject(result), res, 400);
        }
      );
    } else {
      //Иначе вернем код ошибки
      res.send(400);
      res.end();
    }
  });
};

//Обновляем лог по ID
var updateById = (req, res) => {
  let taskLog = req.body;
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "update task_log " +
      " set  " +
      " task_id=?,  " +
      " comment=?,  " +
      " execution_start=CONCAT(DATE(execution_start),  ?),  " +
      " execution_end=CONCAT(DATE(execution_end),  ?)  " +
      " where id=?",
    [
      taskLog.task_id,
      taskLog.comment,
      " " + taskLog.execution_start,
      " " + taskLog.execution_end,
      taskLog.id
    ],
    function(error, results) {
      //Если обновили — получим этот объект и вернем уже его
      if (typeof results.affectedRows === "number") {
        connection.query(
          "select " +
            " tl.id, " +
            " tl.task_id, " +
            " t.name task_name," +
            " tl.comment," +
            " DATE_FORMAT(tl.execution_start,'%H:%i') execution_start, " +
            " DATE_FORMAT(tl.execution_end,'%H:%i') execution_end," +
            " TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end) execution_time" +
            " from task_log tl, tasks t where tl.task_id = t.id and tl.id =? and t.user_id =? " +
            " order by tl.id desc",
          [taskLog.id, user.id],
          function(error, results) {
            //Если получилось — вернем результат или код ошибки
            utils.sendResultOrCode(
              error,
              utils.arrayToObject(results),
              res,
              520
            );
          }
        );
      }
    }
  );
};

//Удаляем запись в логе по ID
var deleteById = (req, res) => {
  let id = req.params.id;

  connection.query("delete from task_log where id=?", [id], function(
    error,
    results
  ) {
    utils.sendResultOrCode(error, results, res, 520);
  });
};

//Удаляем все записи в логе по задаче
//Используется только внутри API, посему здесь без req и res
var deleteByTaskId = (taskId, callback) => {
  connection.query("delete from task_log where task_id=?", [taskId], function(
    error
  ) {
    if (error) throw error;
    try {
      callback(true);
    } catch {
      callback(false);
    }
  });
};

module.exports.getByDate = getByDate;
module.exports.add = add;
module.exports.updateById = updateById;
module.exports.deleteById = deleteById;
module.exports.deleteByTaskId = deleteByTaskId;
