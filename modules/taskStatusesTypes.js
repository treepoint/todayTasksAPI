const tokens = require("./tokens.js");
const config = require("../config");

var connection = config.db.get;

//Получаем все типы статусов
var getAll = callback => {
  connection.query("select * from task_statuses_types", function(
    error,
    results
  ) {
    try {
      callback(results);
    } catch {
      callback(error);
    }
  });
};

module.exports.getAll = getAll;
