const tokens = require("./tokens.js");
const utils = require("./utils.js");
const newUserData = require("./newUserData");
const config = require("../config");

var connection = config.db.get;

//Получаем проект по ID
var getById = (req, res) => {
  let id = req.params.id;
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "select * from projects where id=? and user_id =?",
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

//Получаем все проекты пользователя
var getByUser = (req, res) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "  select c.* " +
    "  from projects c  " +
    " where (c.close_date is null or exists (select 1 from tasks t where t.project_id = c.id)) " +
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

//Добавляем проект
var add = (req, res) => {
  let project = req.body;
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "insert into projects set ?",
    {
      user_id: user.id,
      name: project.name,
      name_style: project.name_style,
      description: project.description,
      create_date: utils.getCurrentDate(),
    },
    function (error, results) {
      //Если добавили — получим этот объект и вернем уже его
      if (typeof results.insertId === "number") {
        connection.query(
          "select * from projects where id=? and user_id =?",
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

//Обновляем проект по ID
var updateById = (req, res) => {
  let id = req.params.id;
  let project = req.body;
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "update projects set name=?, name_style = ?, description=?, close_date=? Where id=? and user_id =?",
    [
      project.name,
      JSON.stringify(project.name_style),
      project.description,
      utils.formatDate(project.close_date),
      id,
      user.id,
    ],
    function (error, results) {
      //Если обновили — получим этот объект и вернем уже его
      if (typeof results.affectedRows === "number") {
        connection.query(
          "select * from projects where id=? and user_id =?",
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

//Создаем тестовый проект
var createFirstUserProject = (user_id) => {
  connection.query(
    "insert into projects set ?",
    {
      user_id: user_id,
      name: newUserData.firstProjectName,
      name_style: "{}",
      description: newUserData.firstProjectDescription,
      create_date: utils.getCurrentDate(),
    })
}

module.exports.getById = getById;
module.exports.getByUser = getByUser;
module.exports.add = add;
module.exports.updateById = updateById;
module.exports.createFirstUserProject = createFirstUserProject;
