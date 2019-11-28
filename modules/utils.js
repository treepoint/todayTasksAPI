var sendResultOrCode = function(result, code, res) {
  if (!result) {
    res.send(code);
    res.end();
  } else {
    res.end(JSON.stringify(result));
  }
};

module.exports.sendResultOrCode = sendResultOrCode;
