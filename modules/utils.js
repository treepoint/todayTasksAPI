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

//Получить текущую дату
var getCurrentDate = function() {
  var formatDate = new Date();
  var dd = String(formatDate.getDate()).padStart(2, "0");
  var mm = String(formatDate.getMonth() + 1).padStart(2, "0");
  var yyyy = formatDate.getFullYear();

  return yyyy + "-" + mm + "-" + dd;
};

module.exports.sendResultOrCode = sendResultOrCode;
module.exports.getCurrentDate = getCurrentDate;
