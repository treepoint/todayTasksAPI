const utils = require("./utils.js");
const config = require("../config");

var connection = config.db.get;

//Получаем все типы статусов
var getAll = (req, res) => {
  connection.query("select * from task_statuses_types", function(
    error,
    results
  ) {
    utils.sendResultOrCode(error, utils.arrayToObject(results), res, 404);
  });
};

module.exports.getAll = getAll;
