//Отправляем результат или код
var sendResultOrCode = function (error, result, response, code) {
  if (error) throw error;
  try {
    response.end(JSON.stringify(result));
  } catch {
    response.send(code);
    response.end();
  }
};

//Отформатировать дату
var formatDate = function (date) {

  if (!date) {
    return date;
  }

  var formatDate = new Date(date);
  var dd = String(formatDate.getDate()).padStart(2, "0");
  var mm = String(formatDate.getMonth() + 1).padStart(2, "0");
  var yyyy = formatDate.getFullYear();

  return yyyy + "-" + mm + "-" + dd;
};


//Получить текущую дату
var getCurrentDate = function () {
  var formatDate = new Date();
  var dd = String(formatDate.getDate()).padStart(2, "0");
  var mm = String(formatDate.getMonth() + 1).padStart(2, "0");
  var yyyy = formatDate.getFullYear();

  return yyyy + "-" + mm + "-" + dd;
};

//Получить текущую дату и время
var getCurrentDateTime = function () {
  var date = new Date();

  var dd = String(date.getDate()).padStart(2, "0");
  var mm = String(date.getMonth() + 1).padStart(2, "0");
  var yyyy = date.getFullYear();

  var hh = date.getHours();
  var MM = date.getMinutes();

  return yyyy + "-" + mm + "-" + dd + " " + hh + ":" + MM;
};

//Преобразовать массив в объект, где ID — название объекта
var arrayToIdObject = function (array) {
  let object = {};

  array.forEach(item => {
    //Создаем в объекте свойство с нужным ID
    object[item.id] = item;
  });

  return object;
};

//Преобразовать массив в объект
var arrayToObject = function (array) {
  let object = {};

  array.forEach(item => {
    //Создаем в объекте свойство
    Object.assign(object, item);
  });

  return object;
};

module.exports.arrayToObject = arrayToObject;
module.exports.arrayToIdObject = arrayToIdObject;
module.exports.sendResultOrCode = sendResultOrCode;
module.exports.formatDate = formatDate;
module.exports.getCurrentDate = getCurrentDate;
module.exports.getCurrentDateTime = getCurrentDateTime;
