const fs = require("fs");

const readFromFile = (path, callback) => {
  fs.readFile(path, "utf-8", (err, data) => {
    callback(err, data);
  });
};

const writeJsonFile = (path, data, callback) => {
  fs.writeFile(path, JSON.stringify(data, null, 2), (err) => {
    callback(err);
  });
};

const filterObject = (object, allKeys) => {
  let newObject = {};
  let notFound = [];

  allKeys.forEach((element) => {
    if (object[element]) {
      newObject[element] = object[element];
    } else {
      notFound.push(element);
    }
  });

  const message = notFound.length
    ? `${notFound.join(" and ")} are required.`
    : "";

  return { newObject, warnings: message };
};

const resObject = (success, message, error, data) => {
  return {
    success,
    message,
    error,
    data,
  };
};

module.exports = {
  readFromFile,
  writeJsonFile,
  filterObject,
  resObject,
};
