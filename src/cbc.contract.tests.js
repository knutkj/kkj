/// <reference path="qunit.js" />
/// <reference path="cbc.ns.js" />
/// <reference path="cbc.priv.js" />
/// <reference path="cbc.contract.js" />

//function getFuncs (ns) {
//    var funcs = [];
//    for (var prop in ns) {
//        if (typeof ns[prop] === "function") {
//            funcs.push(ns[prop]);
//        }
//    }
//    return funcs;
//}
//
//function getFuncInfos (funcs) {
//    var funcInfos = [];
//    var i = 0;
//    var func;
//    for (; i < funcs.length; i++) {
//        func = funcs[i];
//        try {
//            funcInfos.push(cbc.parse.func(func).getName());
//        } catch (e) {}
//    }
//    return funcInfos;
//}
//
//var funcs = getFuncs(cbc.priv.assert);
//var funcInfos = getFuncInfos(funcs);
//for (var i = 0; i < funcInfos.length; i++) {
//    console.log(funcInfos[i]);
//}

module("cbc.priv.contract.Contract");

test("getFuncInfo: returns FuncInfo specified in ctor", function () {

    // Fixture setup...
    function func () {};
    var funcInfo = new cbc.priv.parse.FuncInfo(func);
    var contract = new cbc.priv.contract.Contract(funcInfo);
    
    // Exercise SUT...
    var actualFuncInfo = contract.getFuncInfo();
    
    // Verify SUT...
    strictEqual(actualFuncInfo, funcInfo);
    
    // Fixture teardown...
});

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

test("wrap: copies documentation", function () {

    // Fixture setup...
    function func () {
        /// <summary>The func function</summary>
    }
    var doc = cbc.parse.getDoc(func.toString());
    
    // Exercise SUT...
    var contract = cbc.contract.wrap(func);
    
    // Verify SUT...
    var contractDoc = cbc.parse.getDoc(contract.toString());
    strictEqual(contractDoc, doc);
    
    // Fixture teardown...
});

test("wrap: wrapped func called with this context", function () {

    // Fixture setup...
    function func () {
        /// <summary>The func function</summary>
        this.otherFuncInContext();
    }
    var otherFuncInContextCalled = false;
    var ctx = {
        func: cbc.contract.wrap(func),
        otherFuncInContext: function () {
            otherFuncInContextCalled = true;
        }
    };
    var doc = cbc.parse.getDoc(func.toString());
    
    // Exercise SUT...
    var contract = ctx.func();
    
    // Verify SUT...
    strictEqual(otherFuncInContextCalled, true, "otherFuncInContextCalled");
    
    // Fixture teardown...
});

test("wrap: wrapped func declared with args", function () {

    // Fixture setup...
    function func (a) {}
    
    // Exercise SUT...
    var contract = cbc.contract.wrap(func);
    
    // Verify SUT...
    var funcInfo = cbc.parse.func(contract);
    strictEqual(contract.length, 1);
    strictEqual(funcInfo.get_params()[0].get_name(), "a");
    
    // Fixture teardown...
});

function getFuncWithArg (type) {
    return new Function("a", [
        '/// <param name="a" type="' + type + '" />',
        'ok(false, "Assert should stop wrapped from running.");'
    ].join("\n"));
}

test("wrap: adds type assertions", function () {

    // Exercise and verify SUT...
    raises(function () {
        cbc.contract.wrap(getFuncWithArg("boolean"))(1);
    }, function (e) {
        return e.message === "Parameter a must be of type boolean.";
    });
    raises(function () {
        cbc.contract.wrap(getFuncWithArg("Function"))(1);
    }, function (e) {
        return e.message === "Parameter a must be of type function.";
    });
    raises(function () {
        cbc.contract.wrap(getFuncWithArg("Number"))(true);
    }, function (e) {
        return e.message === "Parameter a must be of type number.";
    });
    raises(function () {
        cbc.contract.wrap(getFuncWithArg("Object"))(true);
    }, function (e) {
        return e.message === "Parameter a must be of type object.";
    });
    raises(function () {
        cbc.contract.wrap(getFuncWithArg("string"))(1);
    }, function (e) {
        return e.message === "Parameter a must be of type string.";
    });
    
    // Fixture teardown...
});

test("wrap: calls wrapped with args", function () {

    // Fixture setup...
    var fCalled = false;
    var expectedArg = "arg";
    function f (a) {
        fCalled = true;
        strictEqual(a, expectedArg);
    }
    var contract = cbc.contract.wrap(f);
    
    // Exercise SUT...
    contract(expectedArg);
    
    // Verify SUT...
    strictEqual(fCalled, true, "fCalled");
    
    // Fixture teardown...
});