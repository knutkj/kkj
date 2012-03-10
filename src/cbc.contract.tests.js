/// <reference path="qunit.js" />
/// <reference path="cbc.ns.js" />
/// <reference path="cbc.priv.js" />
/// <reference path="cbc.parse.js" />
/// <reference path="cbc.contract.js" />

module("cbc.priv.contract");

test("assertionString: works for string", function () {

    // Fixture setup...
    function f (a) {
        /// <param name="a" type="String" />
    }
    var assertionString = cbc.priv.contract.assertionString;
    var nfo = cbc.parse.func(f);
    
    // Exercise SUT...
    var res = assertionString(nfo.get_params()[0]);
    
    // Verify SUT...
    strictEqual([
            'cbc.assert.param("a", a).is.',
            "defined().and.notNull().and.string();"
        ].join(""),
        res
    );
    
    // Fixture teardown...
});

test("assertionString: works for function", function () {

    // Fixture setup...
    function f (a) {
        /// <param name="a" mayBeNull="true"
        ///     optional="true" type="Function" />
    }
    var assertionString = cbc.priv.contract.assertionString;
    var nfo = cbc.parse.func(f);
    
    // Exercise SUT...
    var res = assertionString(nfo.get_params()[0]);
    
    // Verify SUT...
    strictEqual('cbc.assert.param("a", a).is.func();', res);
    
    // Fixture teardown...
});

test("assertionString: works for boolean", function () {

    // Fixture setup...
    function f (a) {
        /// <param name="a" optional="true" type="Boolean" />
    }
    var assertionString = cbc.priv.contract.assertionString;
    var nfo = cbc.parse.func(f);
    
    // Exercise SUT...
    var res = assertionString(nfo.get_params()[0]);
    
    // Verify SUT...
    strictEqual(
        'cbc.assert.param("a", a).is.notNull().and.bool();', res
    );
    
    // Fixture teardown...
});

// ----------------------------------------------------------------------------

module("cbc.contract");

test("wrap: no doc, no wrap", function () {

    // Fixture setup...
    function func () {}
    
    // Exercise SUT...
    var contract = cbc.contract.wrap(func);
    
    // Verify SUT...
    strictEqual(contract, func);
    
    // Fixture teardown...
});

test("wrap: empty doc, no wrap", function () {

    // Fixture setup...
    function func () {
        ///
        ///
    }
    
    // Exercise SUT...
    var contract = cbc.contract.wrap(func);
    
    // Verify SUT...
    strictEqual(contract, func);
    
    // Fixture teardown...
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
    cbc.priv.contract.contracts = [];
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
    cbc.priv.contract.contracts = [];
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
    cbc.priv.contract.contracts = [];
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
    cbc.priv.contract.contracts = [];
});

test("wrap: calls wrapped with args", function () {

    // Fixture setup...
    var fCalled = false;
    var expectedArg = "arg";
    function f (a) {
        /// <summary>The f function.</summary>
        fCalled = true;
        strictEqual(a, expectedArg);
    }
    var contract = cbc.contract.wrap(f);
    
    // Exercise SUT...
    contract(expectedArg);
    
    // Verify SUT...
    strictEqual(fCalled, true, "fCalled");
    
    // Fixture teardown...
    cbc.priv.contract.contracts = [];
});

test("wrap: adds _func and get_func", function () {

    // Fixture setup...
    function f (a) {
        /// <summary>The f function.</summary>
    }
    
    // Exercise SUT...
    var contract = cbc.contract.wrap(f);
    
    // Verify SUT...
    strictEqual(contract._func, f);
    strictEqual(contract.get_func(), f);
    
    // Fixture teardown...
    cbc.priv.contract.contracts = [];
});

test("wrap: creates contract", function () {

    // Fixture setup...
    var old = cbc.contract.Contract;
    function f (a) {
        /// <summary>The f function.</summary>
    }
    var contractCreated = false;
    cbc.contract.Contract = function (actualFunction) {
        contractCreated = true;
        strictEqual(actualFunction, f);
        this.get_funcInfo = function () {
            return cbc.parse.func(f);
        }
    }
    
    // Exercise SUT...
    var contract = cbc.contract.wrap(f);
    
    // Verify SUT...
    strictEqual(contractCreated, true, "contractCreated");
    
    // Fixture teardown...
    cbc.contract.Contract = old;
});

test("test test", function () {

    // Fixture setup...
    function f (a, b) {
        /// <param name="a" type="Number" />
        /// <param name="b" type="Boolean" />
    }
    var fw = cbc.contract.wrap(f);
    //alert(fw.toString());
    fw(1, false);
    // Exercise SUT...
    
    // Verify SUT...
    
    // Fixture teardown...
    cbc.priv.contract.contracts = [];
});

// ----------------------------------------------------------------------------

module("cbc.contract.Contract");

test("ctor: does lots", function () {

    // Fixture setup...
    var old = cbc.parse.func;
    function f () {
        /// <summary>The f function.</summary>
    }
    var parseCalled = false;
    var expectedFuncInfo = "nfo";
    cbc.parse.func = function (actualFunc) {
        parseCalled = true;
        strictEqual(actualFunc, f);
        return expectedFuncInfo;
    };
    
    // Exercise SUT...
    var contract = new cbc.contract.Contract(f);
    
    // Verify SUT...
    strictEqual(contract._func, f);
    strictEqual(parseCalled, true, "parseCalled");
    strictEqual(contract._funcInfo, expectedFuncInfo);
    var allContracts = cbc.contract.all();
    strictEqual(allContracts.length, 1);
    strictEqual(allContracts[0], contract);
    strictEqual(f._contract, contract);
    strictEqual(f.get_contract(), contract);
    
    // Fixture teardown...
    cbc.parse.func = old;
    cbc.priv.contract.contracts = [];
});

test("get_func: returns this._func", function () {

    // Fixture setup...
    var get_func = cbc.contract.Contract.prototype.get_func;
    var ctx = { _func: "func" };
    
    // Exercise SUT...
    var actualFunc = get_func.call(ctx);
    
    // Verify SUT...
    strictEqual(actualFunc, ctx._func);
    
    // Fixture teardown...
});

test("get_funcInfo: returns this._funcInfo", function () {

    // Fixture setup...
    var get_funcInfo = cbc.contract.Contract.prototype.get_funcInfo;
    var ctx = { _funcInfo: "funcInfo" };
    
    // Exercise SUT...
    var actualFuncInfo = get_funcInfo.call(ctx);
    
    // Verify SUT...
    strictEqual(actualFuncInfo, ctx._funcInfo);
    
    // Fixture teardown...
});