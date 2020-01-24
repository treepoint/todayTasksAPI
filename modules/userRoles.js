const config = require("../config");
const utils = require("./utils.js");

var connection = config.db.get;

//Получаем все роли
var getAll = (req, res) => {
  connection.query(
    "select r.id, r.name, r.description" + " from roles r",
    function(error, results) {
      utils.sendResultOrCode(error, utils.arrayToObject(results), res, 404);
    }
  );
};

module.exports.getAll = getAll;
