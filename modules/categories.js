const tokens = require("./tokens.js");
const utils = require("./utils.js");
const config = require("../config");

var connection = config.db.get;

//Получаем категорию по ID
var getById = (req, res) => {
  let id = req.params.id;
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    " select c.*, " +
      " (select count(1)  " +
      "    from tasks ts " +
      " where ts.category_id = c.id " +
      "   and (ts.closed_date is null or ts.closed_date > DATE_FORMAT(CURDATE(),'%Y-%m-%d'))) active_tasks_count " +
      "  from categories c " +
      " where c.category_id = ?  " +
      "   and c.user_id = ?",
    [id, user.id],
    function (error, results) {
      //Преобразуем стили в объект
      let result = results.map((item) => {
        item.name_style = JSON.parse(item.name_style);

        return item;
      });

      utils.sendResultOrCode(error, result, res, 404);
    }
  );
};

//Получаем все категории пользователя
var getByUser = (req, res) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    " select c.*, " +
      " (select count(1)  " +
      "    from tasks ts " +
      " where ts.category_id = c.id " +
      "   and (ts.closed_date is null or ts.closed_date > DATE_FORMAT(CURDATE(),'%Y-%m-%d'))) active_tasks_count " +
      "  from categories c " +
      " where (c.close_date is null or exists (select 1 from tasks t where t.category_id = c.id))  " +
      "   and user_id = ?",
    [user.id],
    function (error, results) {
      //Преобразуем стили в объект
      let result = results.map((item) => {
        item.name_style = JSON.parse(item.name_style);

        return item;
      });

      utils.sendResultOrCode(error, utils.arrayToIdObject(result), res, 404);
    }
  );
};

//Добавляем категорию
var add = (req, res) => {
  let category = req.body;
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "insert into categories set ?",
    {
      user_id: user.id,
      name: category.name,
      name_style: category.name_style,
      description: category.description,
      create_date: utils.getCurrentDate(),
    },
    function (error, results) {
      //Если добавили — получим этот объект и вернем уже его
      if (typeof results.insertId === "number") {
        connection.query(
          " select c.*, " +
            " (select count(1)  " +
            "    from tasks ts " +
            " where ts.category_id = c.id " +
            "   and (ts.closed_date is null or ts.closed_date > DATE_FORMAT(CURDATE(),'%Y-%m-%d'))) active_tasks_count " +
            "  from categories c " +
            " where c.id = ?  " +
            "   and c.user_id = ?",
          [results.insertId, user.id],
          function (error, results) {
            //Преобразуем стили в объект
            let result = results.map((item) => {
              item.name_style = JSON.parse(item.name_style);

              return item;
            });
            //Если получилось — вернем результат или код ошибки
            utils.sendResultOrCode(
              error,
              utils.arrayToIdObject(result),
              res,
              400
            );
          }
        );
      } else {
        //Иначе вернем код ошибки
        res.send(400);
        res.end();
      }
    }
  );
};

//Обновляем категорию по ID
var updateById = (req, res) => {
  let id = req.params.id;
  let category = req.body;

  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "update categories set name=?, name_style = ?, description=?, close_date=? Where id=? and user_id =?",
    [
      category.name,
      JSON.stringify(category.name_style),
      category.description,
      category.close_date,
      id,
      user.id,
    ],
    function (error, results) {
      //Если обновили — получим этот объект и вернем уже его
      if (typeof results.affectedRows === "number") {
        connection.query(
          " select c.*, " +
            " (select count(1)  " +
            "    from tasks ts " +
            " where ts.category_id = c.id " +
            "   and (ts.closed_date is null or ts.closed_date > DATE_FORMAT(CURDATE(),'%Y-%m-%d'))) active_tasks_count " +
            "  from categories c " +
            " where c.id = ?  " +
            "   and c.user_id = ?",
          [id, user.id],
          function (error, results) {
            //Преобразуем стили в объект
            let result = results.map((item) => {
              item.name_style = JSON.parse(item.name_style);

              return item;
            });
            //Если получилось — вернем результат или код ошибки
            utils.sendResultOrCode(
              error,
              utils.arrayToIdObject(result),
              res,
              400
            );
          }
        );
      }
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
    function (error, results) {
      utils.sendResultOrCode(error, results, res, 520);
    }
  );
};

module.exports.getById = getById;
module.exports.getByUser = getByUser;
module.exports.add = add;
module.exports.updateById = updateById;
module.exports.closeById = closeById;
