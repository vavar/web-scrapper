const Database = require('./data');
const instance;
module.exports = {
    init: function (options, callback) {
        instance = new Database(options, callback);
        return instance;
    },
    instance: function (params) {
        return instance;
    }
}