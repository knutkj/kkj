/// <reference path="qunit.js" />
/// <reference path="cbc.ns.js" />
/// <reference path="cbc.priv.js" />
/// <reference path="cbc.contract.js" />

module("cbc.priv.contract.Contract");

//test("getFunc: returns func specified in ctor", function () {
//
//    // Fixture setup...
//    function func () {};
//    var contract = new cbc.priv.contract.Contract(func);
//    
//    // Exercise SUT...
//    var actualFunc = contract.getFunc();
//    
//    // Verify SUT...
//    strictEqual(func, actualFunc);
//    
//    // Fixture teardown...
//});
//
//test("getFuncName: returns func name", function () {
//
//    // Fixture setup...
//    function funcWithName () {};
//    var contract = new cbc.priv.contract.Contract(funcWithName);
//    
//    // Exercise SUT...
//    var funcName = contract.getFuncName();
//    
//    // Verify SUT...
//    strictEqual(funcName, "funcWithName");
//    
//    // Fixture teardown...
//});

// ----------------------------------------------------------------------------

module("cbc.contract");

test("forFunc: invalid func, error", function () {

    // Exercise and verify SUT...
    raises(function () {
        cbc.contract.forFunc();
    }, function (e) {
        return e.message === "Parameter func must be specified.";
    });
    raises(function () {
        cbc.contract.forFunc(null);
    });
    raises(function () {
        cbc.contract.forFunc(1);
    });

    // Fixture teardown...
});

test("ctor: adds contract to all", function () {

    // Fixture setup...
    var old = cbc.priv.contract.Contract;
    var ctorCalled = false;
    var expectedFunc = function () {};
    cbc.priv.contract.Contract = function (actualFunc) {
        ctorCalled = true;
        strictEqual(expectedFunc, actualFunc);
    };
    var contract = cbc.contract.forFunc(expectedFunc);
    
    // Exercise SUT...
    var allContracts = cbc.contract.all();
    
    // Verify SUT...
    strictEqual(ctorCalled, true, "ctorCalled");
    strictEqual(allContracts.length, 1);
    strictEqual(allContracts[0], contract);
    strictEqual(cbc.priv.contract.contracts, allContracts);
    
    // Fixture teardown...
    cbc.priv.contract.Contract = old;
});