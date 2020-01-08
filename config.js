"use strict";

var mysql = require("mysql");

module.exports = {
  name: "haveDoneAPI",
  hostname: "http://localhost/api/",
  version: "0.3.2",
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  db: {
    get: mysql.createConnection({
      host: "192.168.0.99",
      port: "3306",
      user: "haveDone",
      password: "test",
      database: "test_haveDoneDB"
    })
  },
  jwt: {
    secret: "&@$!changeme!$@&",
    refreshSecret: "&@$!changememe!$@&",
    expiresIn: "4320m",
    refreshExpiresIn: "5760m"
  }
};
