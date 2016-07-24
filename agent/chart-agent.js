'use strict';

const querystring = require('querystring');
const http = require('http');
const EventEmitter = require('events');
const logger = require('winston');

//=============================
// Constants / Variables
//=============================
const CHART_POST_DATA = querystring.stringify({
    'index': 'ixic'
});

const CHART_OPTIONS = {
    host: 'www.nasdaq.com',
    port: 80,
    path: '/aspx/IndexData.ashx',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Length': Buffer.byteLength(CHART_POST_DATA)
    }
};


//=============================
// Chart Agent Class
// ----------------------------
// nasdaq chart data scraper
//=============================
class ChartAgent {
    constructor(db) {
        if (!db) {
            throw new Error('DataStore should be define');
        }
        this.lastUpdateTime = undefined;
        this.db = db;
    }

    start() {
        let self = this;
        logger.info('start Agent .. ');
        this.db.getLastUpdateTime().then(function (data) {
            if (data && data.length) {
                self.lastUpdateTime = +data[0].value;
            } else {
                self.db.initLastUpdateTime();
            }
            process.nextTick(function () { self.queryData(); self = null; });
        })
    }

    queryData() {
        logger.info('queryData .. ');
        let self = this;
        let req = http.request(CHART_OPTIONS,
            function (res) {
                self.onQueryResponse(res);
            });
        req.on('error', (e) => {
            logger.info(`problem with request: ${e.message}`);
            this.req = null;
        });

        req.write(CHART_POST_DATA);
        req.end();
    }

    onQueryResponse(res) {

        let content = '';

        if (!res) {
            logger.info('Response is undefined');
            return;
        }

        if (res.statusCode !== 200) {
            logger.info(`STATUS: ${res.statusCode}`);
            logger.info(`HEADERS: ${JSON.stringify(res.headers)}`);
            return;
        }

        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            content += chunk;
        });

        res.on('end', () => {
            let obj = this.parseContent(content);
            this.onQuerySuccess(obj);
            content = null;
        });
    }

    parseContent(content) {
        logger.info('parsing response content ... ');
        try {
            return JSON.parse(content);
        } catch (e) {
            logger.error(`parse content error : ${e}`);
        }
        return null;
    }

    onQuerySuccess(content) {
        if (!content || !content.data || !content.data.length) {
            return;
        }
        let self = this;
        let truncate = content.data.filter((element) => {
            if (!this.lastUpdateTime) {
                this.lastUpdateTime = element.x;
                return true;
            }

            //store only new data
            if (this.lastUpdateTime >= element.x) {
                return false;
            }

            this.lastUpdateTime = element.x;
            return true;
        });

        // no update data
        if (!truncate.length) {
            logger.info('no data updated ... ');
            //periodically scrape data every 5 mins
            logger.info('scheduling for next 5 mins ...');
            setTimeout(function () { self.queryData(); self = null; }, 5 * 60 * 1000);
            return;
        }

        let data = truncate.map((value) => {
            return { 'name': 'nasdaq', 'date': new Date(value.x), 'value': '' + value.y };
        });


        this.db.storeChartData({ lastUpdateTime: this.lastUpdateTime, data: data }).then(function () {
            //periodically scrape data every 5 mins
            logger.info('scheduling for next 5 mins ...');
            setTimeout(function () { self.queryData(); self = null; }, 5 * 60 * 1000);
        }).catch(function (err) {
            logger.info(`${err}`);
        });
    }
}

module.exports = ChartAgent;