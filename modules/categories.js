const tokens = require("./tokens.js");
const config = require("../config");

var connection = config.db.get;

//Получаем категорию по ID
var getCategoryById = (req, categoryId, callback) => {
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
var getUserCategories = (req, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "select * from categories where user_id =?",
    [user.id],
    function(error, results) {
      if (error) throw error;
      callback(results);
    }
  );
};

//Добавляем категорию
var addCategory = (req, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "INSERT INTO categories SET ?",
    [user.id, req.body.category.name, req.body.category.description],
    function(error, results) {
      if (error) throw error;
      callback(results);
    }
  );
};

//Обновляем пользователя по ID
var updateCategoryById = (req, category, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "UPDATE categories SET `name`=?,`description`=? Where id=? and user_id =?",
    [category.name, category.description, category.id, user.id],
    function(error, results) {
      if (error) throw error;
      callback(results);
    }
  );
};

//Удаляем категорию по ID
var deleteCategoryById = (req, categoryId, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "DELETE FROM categories WHERE id=? and user_id=?",
    [categoryId, user.id],
    function(error) {
      if (error) throw error;
      callback("{success}");
    }
  );
};

module.exports.getCategoryById = getCategoryById;
module.exports.getUserCategories = getUserCategories;
module.exports.addCategory = addCategory;
module.exports.updateCategoryById = updateCategoryById;
module.exports.deleteCategoryById = deleteCategoryById;
