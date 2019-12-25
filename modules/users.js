const config = require("../config");

var connection = config.db.get;

//Получаем по email. Требуется чтобы проверить введенные данные при авторизации
var getByEmail = (req, callback) => {
  connection.query(
    "select * from users where `email`=?",
    [req.body.email],
    function(error, results) {
      if (error) throw error;
      try {
        callback(results[0]);
      } catch {
        callback(null);
      }
    }
  );
};

//Получаем ID пользователя по email или паролю
var getByEmailPassword = (req, callback) => {
  connection.query(
    "select u.id, u.email, u.password, r.name role" +
      " from users u, roles r " +
      " where u.role_id = r.id and u.email=? and u.password=?",
    [req.body.email, req.body.password],
    function(error, results) {
      if (error) throw error;
      try {
        callback(results[0]);
      } catch {
        callback(null);
      }
    }
  );
};

//Получаем пользователя по ID
var getById = (userId, callback) => {
  connection.query(
    "select u.id, u.email, u.password, r.name role" +
      " from users u, roles r " +
      " where u.role_id = r.id and u.id=?",
    [userId],
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

//Получаем всех пользователей
var getAll = callback => {
  connection.query(
    "select u.id, u.email, u.password, u.role_id, r.name role" +
      " from users u, roles r" +
      " where u.role_id = r.id",
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

//Добавляем пользователя
var add = (user, callback) => {
  connection.query("INSERT INTO users SET ?", user, function(error, results) {
    if (error) throw error;
    try {
      callback(results);
    } catch {
      callback(error);
    }
  });
};

//Обновляем пользователя по ID
var updateById = (userId, user, callback) => {
  connection.query(
    "update users set email=?, password=?, role_id=? Where id=?",
    [user.email, user.password, user.role_id, userId],
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

//Удаляем пользователя по ID
var deleteById = (userId, callback) => {
  connection.query("delete from users where id=?", [userId], function(error) {
    try {
      callback("{success}");
    } catch {
      callback("{error}");
    }
  });
};

module.exports.getByEmail = getByEmail;
module.exports.getByEmailPassword = getByEmailPassword;
module.exports.getById = getById;
module.exports.getAll = getAll;
module.exports.add = add;
module.exports.updateById = updateById;
module.exports.deleteById = deleteById;
