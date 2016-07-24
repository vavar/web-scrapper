const Database = require('./data');
module.exports = function (options,callback) {
    return new Database(options,callback);
}