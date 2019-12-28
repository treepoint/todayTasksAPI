const tokens = require("./tokens.js");
const config = require("../config");

var connection = config.db.get;

//Получаем категорию по ID
var getById = (req, categoryId, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "select * from categories where id=? and user_id =?",
    [categoryId, user.id],
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

//Получаем все категории пользователя
var getByUser = (req, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "select * from categories where user_id =?",
    [user.id],
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

//Добавляем категорию
var add = (req, callback) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "INSERT INTO categories SET ?",
    {
      user_id: user.id,
      name: req.body.name,
      description: req.body.description
    },
    function(error, results) {
      if (error) throw error;
      try {
        callback(results);
      } catch {
        callback(error);
      }
    }
  );
};

//Обновляем категорию по ID
var updateById = (req, categoryId, category, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "update categories set name=?, description=? Where id=? and user_id =?",
    [category.name, category.description, categoryId, user.id],
    function(error, results) {
      if (error) throw error;
      try {
        callback(results);
      } catch {
        callback(error);
      }
    }
  );
};

//Удаляем категорию по ID
var deleteById = (req, categoryId, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "delete from categories where id=? and user_id=?",
    [categoryId, user.id],
    function(error) {
      if (error) throw error;
      try {
        callback("{success}");
      } catch {
        callback("{error}");
      }
    }
  );
};

//Получаем время исполнения по категориям
var getTimeExecutionForAll = (req, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "select category_name name, SUM(execution_time) execution_time  from" +
      " (select c.name category_name, TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end) execution_time" +
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
      if (error) throw error;
      try {
        callback(results);
      } catch {
        callback(null);
      }
    }
  );
};

module.exports.getById = getById;
module.exports.getByUser = getByUser;
module.exports.add = add;
module.exports.updateById = updateById;
module.exports.deleteById = deleteById;
module.exports.getTimeExecutionForAll = getTimeExecutionForAll;
