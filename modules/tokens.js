const config = require("../config");
const jwt = require("jsonwebtoken");

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

//Сохраняем токен в базу данных
var saveToken = function(tokenId, userID, expireTime, callback) {
  let expireDate = new Date(expireTime * 1000);

  connection.query(
    "insert into tokens VALUES (?, ?, ?)",

    [tokenId, userID, expireDate],
    function(error) {
      if (error) throw error;
      callback(true);
    }
  );
};

//Создаем токен
var createToken = function(user, callback) {
  //Генерируем токен
  let token = jwt.sign(
    { id: user.id, email: user.email, password: user.password },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn
    }
  );

  //Получаем время создания и время окончания
  let { iat, exp } = jwt.decode(token);

  //Сохраняем токен в базу
  saveToken(token, user.id, exp, isTokenCreated => {
    if (isTokenCreated) {
      //Собираем токен в объект
      token = { token, iat, exp };

      //Если все хорошо — возвращаем токен
      if (isTokenCreated) {
        callback(token);
      }
    }
  });
};

module.exports.saveToken = saveToken;
module.exports.createToken = createToken;
module.exports.getTokenById = getTokenById;
