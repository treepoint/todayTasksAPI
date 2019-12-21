const config = require("../config");

var connection = config.db.get;

//Получаем все роли
var getAll = callback => {
  connection.query(
    "select r.id, r.name, r.description" + " from roles r",
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

module.exports.getAll = getAll;
