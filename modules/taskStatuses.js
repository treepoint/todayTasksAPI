const tokens = require("./tokens.js");
const utils = require("./utils.js");
const config = require("../config");

var connection = config.db.get;

//Получаем статус по ID
var getById = (req, res) => {
  let id = req.params.id;
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "select * from task_statuses where id=? and user_id = ?",
    [id, user.id],
    function(error, results) {
      utils.sendResultOrCode(error, results, res, 404);
    }
  );
};

//Получаем все статусы
var getAll = (req, res) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "select ts.* from task_statuses ts where ts.user_id = ? order by ts.type_id, ts.id asc",
    [user.id],
    function(error, results) {
      utils.sendResultOrCode(error, results, res, 404);
    }
  );
};

//Добавляем статус
var add = (req, res) => {
  let status = req.body;
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "insert into task_statuses set ?",
    {
      name: status.name,
      type_id: status.type_id,
      user_id: user.id,
      create_date: utils.getCurrentDate()
    },
    function(error, results) {
      utils.sendResultOrCode(error, results, res, 400);
    }
  );
};

//Обновляем статус по ID
var updateById = (req, res) => {
  let id = req.params.id;
  let status = req.body;
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "update task_statuses set name=?, name_style=?, type_id = ? where id=? and user_id = ?",
    [
      status.name,
      JSON.stringify(status.name_style),
      status.type_id,
      id,
      user.id
    ],
    function(error, results) {
      utils.sendResultOrCode(error, results, res, 520);
    }
  );
};

//Закрываем статус по ID
var closeById = (req, res) => {
  let id = req.params.id;
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "update task_statuses set close_date=? where id=? and user_id = ?",
    [utils.getCurrentDate(), id, user.id],
    function(error, results) {
      utils.sendResultOrCode(error, results, res, 520);
    }
  );
};

module.exports.getById = getById;
module.exports.getAll = getAll;
module.exports.add = add;
module.exports.updateById = updateById;
module.exports.closeById = closeById;
