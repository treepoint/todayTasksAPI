const config = require("../config");

var connection = config.db.get;

//Получаем ID пользователя по email или паролю
var getUserByEmailPassword = (req, callback) => {
  connection.query(
    "select * from users where `email`=? and `password`=?",
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
  connection.query("select * from users where id=?", [userId], function(
    error,
    results
  ) {
    if (error) throw error;
    try {
      callback(results);
    } catch {
      callback(null);
    }
  });
};

//Получаем всех пользователей
var getUsers = callback => {
  connection.query("select * from users", function(error, results) {
    if (error) throw error;
    callback(results);
  });
};

//Добавляем пользователя
var addUser = (user, callback) => {
  connection.query("INSERT INTO users SET ?", user, function(error, results) {
    if (error) throw error;
    callback(results);
  });
};

//Удаляем пользователя по ID
var deleteUser = (userId, callback) => {
  connection.query("DELETE FROM `users` WHERE `id`=?", [userId], function(
    error
  ) {
    if (error) throw error;
    callback("{success}");
  });
};

//Обновляем пользователя по ID
var updateUserById = (userId, user, callback) => {
  connection.query(
    "UPDATE `users` SET `email`=?,`password`=? Where id=?",
    [user.email, user.password, userId],
    function(error, results) {
      if (error) throw error;
      callback(results);
    }
  );
};

module.exports.getUserByEmailPassword = getUserByEmailPassword;
module.exports.getUserById = getUserById;
module.exports.getUsers = getUsers;
module.exports.addUser = addUser;
module.exports.deleteUser = deleteUser;
module.exports.updateUserById = updateUserById;
