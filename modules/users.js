const config = require("../config");
const utils = require("./utils.js");
const categories = require("./categories");
const tasks = require("./tasks");

var connection = config.db.get;

//Получаем по email. Требуется чтобы отсечь дубли при регистрации
var getByEmail = (req, callback) => {
  connection.query(
    "select * from users where `email`=?",
    [req.body.email],
    function (error, results) {
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
    function (error, results) {
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
var getById = (req, res) => {
  let id = req.params.id;

  connection.query(
    "select u.id, u.email, u.password, u.role_id, r.name role" +
    " from users u, roles r " +
    " where u.role_id = r.id and u.id=?",
    [id],
    function (error, results) {
      utils.sendResultOrCode(error, results, res, 404);
    }
  );
};

//Получаем всех пользователей
var getAll = (req, res) => {
  connection.query(
    "select u.id, u.email, u.role_id, r.name role" +
    " from users u, roles r" +
    " where u.role_id = r.id",
    function (error, results) {
      utils.sendResultOrCode(error, utils.arrayToIdObject(results), res, 404);
    }
  );
};

//Добавляем пользователя
var add = (req, res) => {
  //Но сначала проверям, что такого email еще нет в базе
  getByEmail(req, user => {
    if (!user) {
      connection.query("insert into users set ?", req.body, function (
        error,
        results
      ) {
        let user_id = results.insertId;

        //Если успех — создадим так же и первую категорию и первую таску
        categories.createFirstUserCategory(user_id);

        tasks.createFirstUserTask(user_id);

        // results.insertId — ID свежесозданного пользователя
        utils.sendResultOrCode(error, results, res, 409);
      });
    } else {
      res.send(409);
      res.end();
    }
  });
};

//Обновляем пользователя по ID
var updateById = (req, res) => {
  let user = req.body;

  //Cначала проверям, что такого email еще нет в базе
  checkDouplicateEmailWhileUpdate(user.email, user.id, result => {
    if (!result.emailIsExists) {
      if (typeof user.password !== "undefined") {
        updateEmailAndPassword(req, res);
      } else {
        updateEmailAndRole(req, res);
      }
    } else {
      res.send(409, { error: "такой email уже есть в базе" });
      res.end();
    }
  });
};

var checkDouplicateEmailWhileUpdate = (email, userId, callback) => {
  connection.query(
    "select 1 emailIsExists " +
    "  from users" +
    " where email = ?" +
    "   and id != ?",
    [email, userId],
    function (error, results) {
      callback(utils.arrayToObject(results));
    }
  );
};

var updateEmailAndPassword = (req, res) => {
  let userId = req.params.id;
  let user = req.body;

  connection.query(
    "update users set email=?, password=? where id=?",
    [user.email, user.password, userId],
    function (error, results) {
      //Если добавили — получим этот объект и вернем уже его
      if (typeof results.insertId === "number") {
        connection.query(
          "select u.id, u.email, u.password, u.role_id, r.name role" +
          " from users u, roles r " +
          " where u.role_id = r.id and u.id=?",
          [userId],
          function (error, results) {
            //Если получилось — вернем результат или код ошибки
            utils.sendResultOrCode(
              error,
              utils.arrayToIdObject(results),
              res,
              520
            );
          }
        );
      } else {
        //Иначе вернем код ошибки
        res.send(520);
        res.end();
      }
    }
  );
};

var updateEmailAndRole = (req, res) => {
  let userId = req.params.id;
  let user = req.body;

  connection.query(
    "update users set email=?, role_id=? Where id=?",
    [user.email, user.role_id, userId],
    function (error, results) {
      //Если добавили — получим этот объект и вернем уже его
      if (typeof results.insertId === "number") {
        connection.query(
          "select u.id, u.email, u.password, u.role_id, r.name role" +
          " from users u, roles r " +
          " where u.role_id = r.id and u.id=?",
          [user.id],
          function (error, results) {
            //Если получилось — вернем результат или код ошибки
            utils.sendResultOrCode(
              error,
              utils.arrayToIdObject(results),
              res,
              520
            );
          }
        );
      } else {
        //Иначе вернем код ошибки
        res.send(520);
        res.end();
      }
    }
  );
};

//Удаляем пользователя по ID
var deleteById = (req, res) => {
  let userId = req.params.id;

  connection.query("delete from users where id=?", [userId], function (
    error,
    results
  ) {
    utils.sendResultOrCode(error, results, res, 520);
  });
};

module.exports.getByEmail = getByEmail;
module.exports.getByEmailPassword = getByEmailPassword;
module.exports.getById = getById;
module.exports.getAll = getAll;
module.exports.add = add;
module.exports.updateById = updateById;
module.exports.deleteById = deleteById;
