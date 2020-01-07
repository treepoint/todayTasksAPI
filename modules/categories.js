const tokens = require("./tokens.js");
const utils = require("./utils.js");
const config = require("../config");

var connection = config.db.get;

//Получаем категорию по ID
var getById = (req, res) => {
  let id = req.params.id;
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "select * from categories where id=? and user_id =?",
    [id, user.id],
    function(error, results) {
      utils.sendResultOrCode(error, results, res, 404);
    }
  );
};

//Получаем все категории пользователя
var getByUser = (req, res) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "select * from categories where user_id = ?",
    [user.id],
    function(error, results) {
      utils.sendResultOrCode(error, results, res, 404);
    }
  );
};

//Добавляем категорию
var add = (req, res) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "insert into categories set ?",
    {
      user_id: user.id,
      name: req.body.name,
      description: req.body.description,
      create_date: utils.getCurrentDate()
    },
    function(error, results) {
      utils.sendResultOrCode(error, results, res, 400);
    }
  );
};

//Обновляем категорию по ID
var updateById = (req, res) => {
  let id = req.params.id;
  let category = req.body;

  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "update categories set name=?, name_style = ?, description=? Where id=? and user_id =?",
    [
      category.name,
      JSON.stringify(category.name_style),
      category.description,
      id,
      user.id
    ],
    function(error, results) {
      utils.sendResultOrCode(error, results, res, 520);
    }
  );
};

//Закрываем категорию по ID
var closeById = (req, res) => {
  let id = req.params.id;
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "update categories set close_date=? where id=? and user_id = ?",
    [utils.getCurrentDate(), id, user.id],
    function(error, results) {
      utils.sendResultOrCode(error, results, res, 520);
    }
  );
};

module.exports.getById = getById;
module.exports.getByUser = getByUser;
module.exports.add = add;
module.exports.updateById = updateById;
module.exports.closeById = closeById;
