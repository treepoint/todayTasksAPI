const config = require("../config");
const jwt = require("jsonwebtoken");

var createToken = function(user, secret, expiresIn) {
  //Генерируем токен
  let value = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      password: user.password
    },
    secret,
    {
      expiresIn: expiresIn
    }
  );

  //Собираем токен в объект
  //Получаем время создания и время окончания
  let { iat, exp } = jwt.decode(value);
  let token = { value, iat, exp };

  return token;
};

//Создаем токенs
var createTokens = function(user, callback) {
  let token = createToken(user, config.jwt.secret, config.jwt.expiresIn);

  let refreshToken = createToken(
    user,
    config.jwt.refreshSecret,
    config.jwt.refreshExpiresIn
  );

  callback(token, refreshToken);
};

//Обновляем токен по refresh token
var refreshTokens = function(refreshTokenValue, callback) {
  //Чекаем refresh token
  isValidRefreshToken(refreshTokenValue, isValid => {
    if (isValid) {
      //Если нормально — получим пользователя по токену
      let user = getUserFromToken(refreshTokenValue);

      //Если есть пользователь — создаем токены заново и возвращаем
      createTokens(user, (token, newRefreshToken) => {
        callback(token, newRefreshToken, user);
      });
    }
  });
};

//Проверяем валидность refresh token
var isValidRefreshToken = function(refreshToken, callback) {
  if (refreshToken) {
    jwt.verify(refreshToken, config.jwt.refreshSecret, function(err, decoded) {
      if (err) {
        callback(false);
      } else {
        callback(true);
      }
    });
  }
};

//Получаем пользователя из авторизационных заголовков
var getUserFromHeaders = req => {
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(" ")[1];
    try {
      return getUserFromToken(authorization);
    } catch {
      return null;
    }
  }
};

//Получаем пользователя из токена
var getUserFromToken = tokenValue => {
  let { id, email, role, password } = jwt.decode(tokenValue);

  let user = { id, email, role, password };

  return user;
};

module.exports.getUserFromHeaders = getUserFromHeaders;
module.exports.getUserFromToken = getUserFromToken;
module.exports.createTokens = createTokens;
module.exports.refreshTokens = refreshTokens;
