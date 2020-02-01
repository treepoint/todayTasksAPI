const tokens = require("./tokens.js");
const config = require("../config");
const files = require("./files.js");
const utils = require("./utils.js");

var connection = config.db.get;

//Получаем все пользовательские настройки
var getAll = (req, res) => {
  const user = tokens.getUserFromHeaders(req);

  connection.query(
    "select * from user_settings us where us.user_id = ?",
    [user.id],
    function(error, results) {
      //Если настроек нет — не проблема, создадим
      if (results.length === 0) {
        connection.query(
          "insert into user_settings set ?",
          { user_id: user.id },
          function(error, results) {
            //Если получилось — сформируем и отправим
            if (typeof results.insertId === "number") {
              const userSettings = {
                id: results.insertId,
                user_id: user.id,
                tasks_wallpaper: null
              };
              utils.sendResultOrCode(error, userSettings, res, 400);
            }
          }
        );
      } else {
        //Если настройки есть — просто отправим
        utils.sendResultOrCode(error, utils.arrayToObject(results), res, 400);
      }
    }
  );
};

//Обновляем настройки по ID
var updateById = (req, res) => {
  const id = req.params.id;
  const userSettings = req.body;
  const user = tokens.getUserFromHeaders(req);

  connection.query(
    "update user_settings set tasks_wallpaper=? where id=? and user_id = ?",
    [userSettings.tasks_wallpaper, id, user.id],
    function(error, results) {
      //Если обновили — получим этот объект и вернем уже его
      if (typeof results.affectedRows === "number") {
        utils.sendResultOrCode(error, results, res, 400);
      }
    }
  );
};

//Загружаем обои задач
var loadTasksWallpaper = (req, res) => {
  const user = tokens.getUserFromHeaders(req);

  //Сначала нужно удалить текущий файл, чтобы не плодить мусор
  //Получаем текущий файл
  getCurrentTasksWallpaper(user.id, result => {
    if (result.error) {
      //не смогли — отправим ошибку
      res.end(500, JSON.stringify(result));
      return;
    }

    //Смогли — удаляем
    files.deleteFile(result.tasks_wallpaper, result => {
      //Если не смогли удалить — отправим ошибку
      if (result.error) {
        res.end(502, JSON.stringify(result.error));
        return;
      }

      //Дошли до сюда — запишем файл
      files.writeFile(req.files.file, result => {
        if (result.status) {
          //Если записали — обновим настройки
          updateSettings(result.filename, user.id, result => {
            if (result.error) {
              res.end(500, JSON.stringify(result));
            } else {
              res.end(JSON.stringify(result));
            }
          });
        } else {
          //Не смогли записать — отправим ошибку
          res.end(
            500,
            JSON.stringify({
              error: "Не удалось сохранить новый файл"
            })
          );
        }
      });
    });
  });
};

var getCurrentTasksWallpaper = (user_id, callback) => {
  connection.query(
    "select tasks_wallpaper from user_settings us where us.user_id = ?",
    [user_id],
    function(error, results) {
      if (error) {
        callback({ error: "Не удалось получить текущий файл" });
      } else {
        callback(utils.arrayToObject(results));
      }
    }
  );
};

var updateSettings = (filename, user_id, callback) => {
  //Если записали — обновим настройки
  connection.query(
    "update user_settings set tasks_wallpaper=? where user_id = ?",
    [filename, user_id],
    function(error, results) {
      //Если обновили — отправим имя файла фронту
      if (typeof results.affectedRows === "number") {
        callback({ filename });
      } else {
        //Не обновили — отправим ошибку
        callback({
          error: "Не удалось записать ссылку на файл"
        });
      }
    }
  );
};

module.exports.getAll = getAll;
module.exports.updateById = updateById;
module.exports.loadTasksWallpaper = loadTasksWallpaper;
