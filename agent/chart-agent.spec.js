const ChartAgent = require('./chart-agent');

describe('Agent: Chart', () => {
    var fixture;
    it('when construct without `DataStore`, should throw exception', () => {
        try {
            fixture = new ChartAgent();
            fail();
        } catch (e) {
        }
    });

    describe('parseContent()', () => {
        beforeEach(() => {
            fixture = new ChartAgent({});
        });
        it('when content cannot be parsed, should return null', () => {
            expect(fixture.parseContent('')).toEqual(null);
        });
        it('when content parsed successfully, should return JSON Object', () => {
            expect(fixture.parseContent('{"data":"abc"}')).toEqual({ data: 'abc' });
        });
    });

    describe('onQueryResponse()', () => {
        var responseObj;
        beforeEach(() => {
            fixture = new ChartAgent({put:()=>{}});
            responseObj = {statusCode:200,headers:{},on:()=>{},setEncoding:()=>{}};
        });

        it('when got `response.statusCode` rather than 200, should not execute remain methods',()=>{
            
            responseObj.statusCode = 300;
            spyOn(responseObj,'setEncoding').and.callThrough();
            spyOn(responseObj,'on').and.callThrough();

            fixture.onQueryResponse(responseObj);
            
            expect( responseObj.setEncoding ).not.toHaveBeenCalled();
            expect( responseObj.on ).not.toHaveBeenCalled();
        });

        it('when got working response, should continue workflow',()=>{

            spyOn(responseObj,'on').and.callThrough();
            fixture.onQueryResponse(responseObj);

            expect(responseObj.on).toHaveBeenCalled();
            var spyCalls = responseObj.on.calls;
            expect(spyCalls.count()).toBe(2);
            expect(spyCalls.argsFor(0)[0]).toBe('data');
            expect(spyCalls.argsFor(1)[0]).toBe('end');

            spyOn(fixture,'parseContent').and.returnValue('');
            spyOn(fixture,'onQuerySuccess');

            //active callback for `end` event;
            spyCalls.argsFor(1)[1]();
            expect( fixture.parseContent ).toHaveBeenCalled();
            expect( fixture.onQuerySuccess ).toHaveBeenCalled();
        });
    });

    describe('onQuerySuccess()');
});