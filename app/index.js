'use strict';

const express = require('express')
const logger = require('winston');

const app = express()

module.exports = {
    start: function (dBase, port) {

        const router = express.Router();
        router.get('/', function (req, res) {
            res.json({ message: 'hooray! welcome to our api!' });
        });

        router.get('/chart', function (req, res) {
            dBase.getChartData({}).then(function (result) {
                let chartData = result.map(function(element){
                    return {x:element.date, y: element.value};
                });
                res.json({ data: chartData });
            })
        });

        app.use('/api', router);
        
        app.listen(port, function () {
            logger.info(`service listening at port : ${port}`);
        });
    }
};