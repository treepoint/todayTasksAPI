const config = require("../config");

var connection = config.db.get;

//Получаем токен по ID
var getTokenById = (tokenId, callback) => {
  connection.query("select * from tokens where id=?", [tokenId], function(
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

//Создаем токен
var saveToken = function(tokenId, userID, callback) {
  connection.query(
    "insert into tokens VALUES (?, ?, NOW() + INTERVAL 1 DAY)",
    [tokenId, userID],
    function(error, results, fields) {
      if (error) throw error;
      callback(true);
    }
  );
};

module.exports.saveToken = saveToken;
module.exports.getTokenById = getTokenById;
