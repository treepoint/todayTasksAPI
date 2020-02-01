const fs = require("fs");
const randomstring = require("randomstring");
const FileReader = require("filereader");
const config = require("../config");

//Загружаем файл
var writeFile = (file, callback) => {
  //Сгенерируем имя файла
  const name = randomstring.generate(14);

  //Получим расширение файла
  var re = /(?:\.([^.]+))?$/;
  const extension = re.exec(file.name)[1];

  const filename = name + "." + extension;

  //Объявим ридер
  let reader = new FileReader();

  //Опишем событие при чтении
  reader.onload = function() {
    fs.appendFile(
      config.uploadFilesDirectory + "/" + filename,
      reader.result,
      function(error) {
        if (error) {
          if (typeof callback !== "undefined") {
            callback({ status: false });
          }
        } else {
          if (typeof callback !== "undefined") {
            callback({ status: true, filename });
          }
        }
      }
    );
  };

  //Прочтем сам файл
  reader.readAsArrayBuffer(file);
};

//Удаляем
var deleteFile = (filename, callback) => {
  const path = config.uploadFilesDirectory + "/" + filename;

  if (filename === null) {
    callback({ fileIsNull: true });
    return;
  }

  fs.unlink(path, function(error) {
    if (error) {
      if (typeof callback !== "undefined") {
        callback({ error: "Не удалось удалить файл" });
      }
    } else {
      if (typeof callback !== "undefined") {
        callback({ status: true });
      }
    }
  });
};

module.exports.writeFile = writeFile;
module.exports.deleteFile = deleteFile;
