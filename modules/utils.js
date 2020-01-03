//Отправляем результат или код
var sendResultOrCode = function(error, result, response, code) {
  if (error) throw error;
  try {
    response.end(JSON.stringify(result));
  } catch {
    response.send(code);
    response.end();
  }
};

module.exports.sendResultOrCode = sendResultOrCode;
