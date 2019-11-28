const config = require("../config");
const md5 = require("../node_modules/js-md5");

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
var createToken = function(req, userID, callback) {
  let token = md5(req.body.email + Date.now() + config.salt);

  connection.query(
    "insert into tokens VALUES (?, ?, NOW() + INTERVAL 1 DAY)",
    [token, userID],
    function(error, results, fields) {
      if (error) throw error;
      callback(token);
    }
  );
};

module.exports.createToken = createToken;
module.exports.getTokenById = getTokenById;
