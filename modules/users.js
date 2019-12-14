const config = require("../config");

var connection = config.db.get;

//Получаем по email. Требуется чтобы проверить введенные данные при авторизации
var getUserByEmail = (req, callback) => {
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
var getUserByEmailPassword = (req, callback) => {
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
var getUserById = (userId, callback) => {
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
var getUsers = callback => {
  connection.query(
    "select u.id, u.email, u.password, r.name role" +
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
var addUser = (user, callback) => {
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
var updateUserById = (userId, user, callback) => {
  connection.query(
    "UPDATE `users` SET `email`=?,`password`=? Where id=?",
    [user.email, user.password, userId],
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
var deleteUser = (userId, callback) => {
  connection.query("DELETE FROM `users` WHERE `id`=?", [userId], function(
    error
  ) {
    try {
      callback("{success}");
    } catch {
      callback("{error}");
    }
  });
};

module.exports.getUserByEmail = getUserByEmail;
module.exports.getUserByEmailPassword = getUserByEmailPassword;
module.exports.getUserById = getUserById;
module.exports.getUsers = getUsers;
module.exports.addUser = addUser;
module.exports.updateUserById = updateUserById;
module.exports.deleteUser = deleteUser;
