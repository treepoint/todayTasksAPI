const tokens = require("./tokens.js"),
  users = require("./users.js"),
  utils = require("./utils.js");

//Авторизуемся в API
var auth = function(req, res) {
  //Получаем пользователя по присланным данным
  users.getByEmailPassword(req, user => {
    if (!user) {
      res.send(404);
      res.end();
    } else {
      //Если получили — создаем токен
      tokens.createTokens(user, (token, refreshToken) => {
        //Если создали — отправим клиенту
        res.end(JSON.stringify({ token, refreshToken, user }));
      });
    }
  });
};

//Обновляем авторизацию в API
var reauth = function(req, res) {
  tokens.refreshTokens(req.body.refreshToken, (token, refreshToken, user) => {
    //Если создали — отправим клиенту
    if (token && refreshToken && user) {
      res.send({ token, refreshToken, user });
    } else {
      res.send(404);
      res.end();
    }
  });
};

module.exports.auth = auth;
module.exports.reauth = reauth;
