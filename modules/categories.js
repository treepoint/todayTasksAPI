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
    [user.id, req.body.category.name, req.body.category.description],
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

//Обновляем пользователя по ID
var updateById = (req, category, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "UPDATE categories SET `name`=?,`description`=? Where id=? and user_id =?",
    [category.name, category.description, category.id, user.id],
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
    "DELETE FROM categories WHERE id=? and user_id=?",
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

module.exports.getById = getById;
module.exports.getByUser = getByUser;
module.exports.add = add;
module.exports.updateById = updateById;
module.exports.deleteById = deleteById;
