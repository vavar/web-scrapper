'use strict';

const express = require('express')
const logger = require('winston');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

module.exports = {
    start: function (dBase, port) {

        const router = express.Router();

        // middleware to use for all requests
        router.use(function (req, res, next) {
            next(); // make sure we go to the next routes and don't stop here
        });

        router.get('/', function (req, res) {
        });

        router.get('/chart', function (req, res) {
            logger.info('query with default size');
            dBase.getChartData({ size: 50 }).then(function (result) {
                res.json({ data: result });
            }).catch(function (err) {
                res.json({ message: `${err}` });
            })
        });

        router.get('/chart/:amount', function (req, res) {
            logger.info(`query with custom size : ${req.param.amount}`);
            dBase.getChartData({ size: req.params.amount }).then(function (result) {
                res.json({ data: result });
            }).catch(function (err) {
                res.json({ message: `${err}` });
            })
        });

        app.use('/api', router);

        app.listen(port, function () {
            logger.info(`service listening at port : ${port}`);
        });
    }
};