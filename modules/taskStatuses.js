const tokens = require("./tokens.js");
const config = require("../config");

var connection = config.db.get;

//Получаем статус по ID
var getById = (req, statusId, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "select * from task_statuses where id=?",
    [statusId, user.id],
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

//Получаем все статусы
var getAll = callback => {
  connection.query("select * from task_statuses", function(error, results) {
    if (error) throw error;
    try {
      callback(results);
    } catch {
      callback(null);
    }
  });
};

module.exports.getById = getById;
module.exports.getAll = getAll;
