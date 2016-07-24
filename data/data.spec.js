'use strict';
const Promise = require('bluebird');
const Database = require('./data');

Promise.config({
    // Enable warnings
    warnings: true,
    // Enable long stack traces
    longStackTraces: true,
    // Enable cancellation
    cancellation: true,
    // Enable monitoring
    monitoring: true
});

const knexOptions = {
    client: 'sqlite3',
    // debug: true,
    connection: {
        filename: "./test.sqlite"
    },
    useNullAsDefault: true
};

describe('Class: Database', () => {
    let fixture;
    describe('constructor()', () => {
        it('when defined callback, should call after create table finished', () => {
            let callback = jasmine.createSpy('callback');
            let resolved = Promise.resolve({});
            spyOn(resolved, 'then');
            spyOn(Promise, 'all').and.returnValue(resolved);

            fixture = new Database({ knexConfig: knexOptions }, callback);

            expect(Promise.all).toHaveBeenCalled();
            //jasmine not fast-forward promise();
            resolved.then.calls.argsFor(0)[0]();
            expect(callback).toHaveBeenCalled();
        });
    });

    describe('Method: getChartData()', () => {
        let mockKnex;
        beforeEach(() => {
            mockKnex = jasmine.createSpyObj('knex', ['count', 'select', 'then', 'from', 'where', 'orderBy', 'limit', 'offset', 'map']);
            mockKnex.count.and.returnValue(mockKnex);

            mockKnex.select.and.returnValue(mockKnex);
            mockKnex.from.and.returnValue(mockKnex);
            mockKnex.where.and.returnValue(mockKnex);
            mockKnex.orderBy.and.returnValue(mockKnex);
            mockKnex.limit.and.returnValue(mockKnex);
            mockKnex.offset.and.returnValue(mockKnex);

            fixture = new Database({ knexConfig: knexOptions });
            spyOn(fixture, 'knex').and.callFake(() => mockKnex);
            spyOn(fixture.knex, 'column').and.callFake(() => mockKnex);
        });
        it(`when size is not defined, should query with default value`, () => {
            fixture.getChartData();
            expect(mockKnex.count).toHaveBeenCalled();
            expect(mockKnex.then).toHaveBeenCalled();
            mockKnex.then.calls.argsFor(0)[0]([{ count: 300 }]);
            expect(mockKnex.limit).toHaveBeenCalled();
            expect(mockKnex.limit.calls.argsFor(0)[0]).toEqual(50);
        });

        it(`when size is defined with 'invalid data', should query with default value`, () => {
            fixture.getChartData({ size: 'abc' });
            expect(mockKnex.count).toHaveBeenCalled();
            expect(mockKnex.then).toHaveBeenCalled();
            mockKnex.then.calls.argsFor(0)[0]([{ count: 300 }]);
            expect(mockKnex.limit).toHaveBeenCalled();
            expect(mockKnex.limit.calls.argsFor(0)[0]).toEqual(50);
        });

        it(`when size is null, should query with default value`, () => {
            fixture.getChartData({ size: null });
            expect(mockKnex.count).toHaveBeenCalled();
            expect(mockKnex.then).toHaveBeenCalled();
            mockKnex.then.calls.argsFor(0)[0]([{ count: 300 }]);
            expect(mockKnex.limit).toHaveBeenCalled();
            expect(mockKnex.limit.calls.argsFor(0)[0]).toEqual(50);
        });

        it(`when size is undefined, should query with default value`, () => {
            fixture.getChartData({ size: undefined });
            expect(mockKnex.count).toHaveBeenCalled();
            expect(mockKnex.then).toHaveBeenCalled();
            mockKnex.then.calls.argsFor(0)[0]([{ count: 300 }]);
            expect(mockKnex.limit).toHaveBeenCalled();
            expect(mockKnex.limit.calls.argsFor(0)[0]).toEqual(50);
        });

        it(`when size is defined with over limit (400), should query with limit(400)`, () => {
            fixture.getChartData({ size: 500 });
            expect(mockKnex.count).toHaveBeenCalled();
            expect(mockKnex.then).toHaveBeenCalled();
            mockKnex.then.calls.argsFor(0)[0]([{ count: 300 }]);
            expect(mockKnex.limit).toHaveBeenCalled();
            expect(mockKnex.limit.calls.argsFor(0)[0]).toEqual(400);
        });

        it(`when size is defined within range (not over 400), should query its value`, () => {
            fixture.getChartData({ size: 200 });
            expect(mockKnex.count).toHaveBeenCalled();
            expect(mockKnex.then).toHaveBeenCalled();
            mockKnex.then.calls.argsFor(0)[0]([{ count: 300 }]);
            expect(mockKnex.limit).toHaveBeenCalled();
            expect(mockKnex.limit.calls.argsFor(0)[0]).toEqual(200);
        });
    });
});