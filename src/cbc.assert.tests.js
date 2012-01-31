/// <reference path="https://ajax.googleapis.com/ajax/libs/ext-core/3.1.0/ext-core.js" />
/// <reference path="qunit.js" />
/// <reference path="cbc.private.js" />
/// <reference path="cbc.assert.js" />

// ==============================================
//  cbc.private.assert
// ==============================================

module("cbc.private.assert");

var assertClass = cbc.private.assert.assert;
var assertProto = assertClass.prototype;

test("assertDefined: value undefined, error w correct msg", function () {

    // Fixture setup...
    var ctx = {
        param: "name"
    };

    // Exercise and verify SUT...
    raises(
        function () {
            assertProto.assertDefined.call(ctx);
        },
        function (e) {
            return e.message === 
                "Parameter " + ctx.param + " must be specified.";
        }
    );
});

test("assertDefined: value, nothin", function () {

    // Fixture setup...
    var ctx = {
        param: "name",
        value: null
    };

    // Exercise and verify SUT...
    assertProto.assertDefined.call(ctx);
});

test("assertNotNull: value undefined, nothin", function () {

    // Fixture setup...
    var ctx = {
        param: "name"
    };
    
    // Exercise and verify SUT...
    assertProto.assertNotNull.call(ctx);
    
    // Fixture teardown...
});

test("assertNotNull: value null, error", function () {

    // Fixture setup...
    var ctx = {
        param: "name",
        value: null
    };
    
    // Exercise and verify SUT...
    raises(function () {
        assertProto.assertNotNull.call(ctx);
    }, function (e) {
        return e.message ===
            "Parameter " + ctx.param + " must not be null.";
    });
    
    // Fixture teardown...
});

test("assertNotNull: value ok, nothin", function () {

    // Fixture setup...
    var ctx = {
        param: "name",
        value: 1
    };
    
    // Exercise and verify SUT...
    assertProto.assertNotNull.call(ctx);
    
    // Fixture teardown...
});

test("assertValueOfType: value object type string, raises", function () {

    // Fixture setup...
    var ctx = {
        param: "param",
        value: {}
    };
    var type = "string";
    
    // Exercise and verify SUT...
    raises(function () {
       assertProto.assertValueOfType.call(ctx, type);
    }, function (e) {
        return e.message ===
            "Parameter " + ctx.param + " must be of type " + type + ".";
    });
    
    // Fixture teardown...
});

test("assertValueOfType: val undef/null/empty str, ok", function () {

    // Fixture setup...
    var ctx = {
        param: "param"
    };
    var type = "string";
    
    // Exercise and verify SUT...
    assertProto.assertValueOfType.call(ctx, type);
    ctx.value = null;
    assertProto.assertValueOfType.call(ctx, type);
    ctx.value = "";
    assertProto.assertValueOfType.call(ctx, type);
    
    // Fixture teardown...
});

test("assertNotEmptyString: empty string, error", function () {

    // Fixture setup...
    var ctx = { param: "param", value: "" };
    
    // Exercise and verify SUT...
    raises(function () {
        assertProto.assertNotEmptyString.call(ctx);
    }, function (e) {
        return e.message ===
            "Parameter " + ctx.param + " must not be empty string.";
    });
    
    // Fixture teardown...
});

test("assertNotEmptyString: val undef/null/num/string: ok", function () {
    
    // Exercise and verify SUT...
    assertProto.assertNotEmptyString.call({param: "p" });
    assertProto.assertNotEmptyString.call({param: null });
    assertProto.assertNotEmptyString.call({param: 1 });
    assertProto.assertNotEmptyString.call({param: "string" });
        
    // Fixture teardown...
});

function assertContext () {
    var is = {};
    for (var assert in (new cbc.private.assert.assert().is)) {
        is[assert] = function () {};
    }
    return { stack: [], notEmpty: function () {}, is: is };
}

function numProps (object) {
    var numProps = 0;
    for (var prop in object) { numProps++; };
    return numProps;
}

var numAsserts = numProps(new cbc.private.assert.assert().is);
var numAssertsAfterTypesRemoved = 
    numAsserts - cbc.private.assert.typeAsserts.length;

test("typeAsserts: exists in is", function () {

    // Fixture setup...
    var is = cbc.assert.param("param", "val").is;

    // Exercise SUT...
    var typeAsserts = cbc.private.assert.typeAsserts;

    // Verify SUT...
    for (var i = 0; i < typeAsserts.length; i++) {
        var typeAssert = typeAsserts[i];
        strictEqual(typeof is[typeAssert], "function");
    }

    // Fixture teardown...
});

test("newIs: defined called, removed, rest exist", function () {

    // Fixture setup...
    var expectedAssert = "defined";
    var ctx = assertContext();
    var pushCalled = false;
    ctx.stack.push = function (actualAssert) {
        pushCalled = true;
        strictEqual(actualAssert, expectedAssert);
        ctx.stack[0] = actualAssert;
    };
    var exptectedNumAsserts = numAsserts - 1;
    
    // Exercise SUT...
    var actualIs = assertProto.newIs.call(ctx, expectedAssert).and;
    
    // Verify SUT...
    strictEqual(pushCalled, true, "pushCalled");
    strictEqual(numProps(actualIs), exptectedNumAsserts);
    strictEqual(typeof actualIs.defined, "undefined");    
    
    // Fixture teardown...
});

test("newIs: notNull: removed", function () {

    // Fixture setup...
    var assert = "notNull";
    var ctx = assertContext();
    
    // Exercise SUT...
    var actualIs = assertProto.newIs.call(ctx, assert).and;
    
    // Verify SUT...
    strictEqual(numProps(actualIs), numAsserts - 1);
    strictEqual(typeof actualIs.notNull, "undefined");
    
    // Fixture teardown...
});

test("newIs: bool: types removed", function () {

    // Fixture setup...
    var assert = "bool";
    var ctx = assertContext();
    
    // Exercise SUT...
    var actualIs = assertProto.newIs.call(ctx, assert).and;
    
    // Verify SUT...
    strictEqual(numProps(actualIs), numAssertsAfterTypesRemoved);
    strictEqual(typeof actualIs.defined, "function");
    
    // Fixture teardown...
});

test("newIs: func: types removed", function () {

    // Fixture setup...
    var assert = "func";
    var ctx = assertContext();
    
    // Exercise SUT...
    var actualIs = assertProto.newIs.call(ctx, assert).and;
    
    // Verify SUT...
    strictEqual(numProps(actualIs), numAssertsAfterTypesRemoved);
    strictEqual(typeof actualIs.defined, "function");
    
    // Fixture teardown...
});

test("newIs: number: types removed", function () {

    // Fixture setup...
    var assert = "number";
    var ctx = assertContext();
    
    // Exercise SUT...
    var actualIs = assertProto.newIs.call(ctx, assert).and;
    
    // Verify SUT...
    strictEqual(numProps(actualIs), numAssertsAfterTypesRemoved);
    strictEqual(typeof actualIs.defined, "function");
    
    // Fixture teardown...
});

test("newIs: object: types removed", function () {

    // Fixture setup...
    var assert = "object";
    var ctx = assertContext();
    
    // Exercise SUT...
    var actualIs = assertProto.newIs.call(ctx, assert).and;
    
    // Verify SUT...
    strictEqual(numProps(actualIs), numAssertsAfterTypesRemoved);
    strictEqual(typeof actualIs.defined, "function");
    
    // Fixture teardown...
});

test("newIs: string: types removed, notEmpty added", function () {

    // Fixture setup...
    var assert = "string";
    var ctx = assertContext();
    
    // Exercise SUT...
    var actualIs = assertProto.newIs.call(ctx, assert).and;
    
    // Verify SUT...
    strictEqual(numProps(actualIs), numAssertsAfterTypesRemoved + 1);
    strictEqual(typeof actualIs.defined, "function");
    strictEqual(typeof actualIs.notEmpty, "function");
    
    // Fixture teardown...
});

test("newIs: all asserts: null", function () {

    // Fixture setup...
    var assert = "notEmpty";
    var ctx = assertContext();
    ctx.stack.push("defined", "notNull", "string");
    
    // Exercise SUT...
    var res = assertProto.newIs.call(ctx, assert);
    
    // Verify SUT...
    strictEqual(res, null);
    
    // Fixture teardown...
});

test("ctor: sets param, value and stack", function () {

    // Fixture setup...
    var expectedParam = "param";
    var expectedValue = "value";
    
    // Exercise SUT...
    var assert = new assertClass(expectedParam, expectedValue);
    
    // Verify SUT...
    strictEqual(assert.param, expectedParam);
    strictEqual(assert.value, expectedValue);
    strictEqual(Ext.isArray(assert.stack), true);
    
    // Fixture teardown...
});

test("ctor: notEmpty not in is", function () {

    // Fixture setup...
    
    // Exercise SUT...
    var is = new assertClass("param", "val").is;
    
    // Verify SUT...
    strictEqual(typeof is.notEmpty, "undefined");
    
    // Fixture teardown...
});

//// ==============================================
////  cbc.assert
//// ==============================================

module("cbc.assert");

test("that: same as cbc.assert", function () {

    // Fixture setup...
    var assert = cbc.assert;
    
    // Exercise SUT...
    var that = assert.that;

    // Verify SUT...
    strictEqual(assert, that);
});

test("param: name undefined/null/(not/empty) string, raises", function () {

    // Exercise and verify SUT...
    raises(function () {
        cbc.assert.that.param();
    }, function (e) {
        return e.message === "Parameter name must be specified.";
    });
    raises(function () {
        cbc.assert.that.param(null);
    }, function (e) {
        return e.message === "Parameter name must not be null.";
    });
    raises(function () {
        cbc.assert.that.param(1);
    }, function (e) {
        return e.message === "Parameter name must be of type string.";
    });
    raises(function () {
        cbc.assert.that.param("");
    }, function (e) {
        return e.message === "Parameter name must not be empty string.";
    });
    
    // Fixture teardown...
});

test("param: creates new assert", function () {

    // Exercise SUT...
    var assert = cbc.assert.that.param("name");

    // Verify SUT...
    strictEqual(numProps(assert), 1);
    strictEqual(typeof assert.is, "object");
});

test("defined: calls assertDefined and newIs w args", function () {

    // Fixture setup...
    var assertDefinedCalled = false;
    var newIsCalled = false;
    var expectedAssert = "defined";
    var newIs = "theNewIs";
    var assert = Ext.apply(
        new cbc.private.assert.assert("param", "value"), 
        {
            assertDefined: function () {
                assertDefinedCalled = true;
            },
            newIs: function (actualAssert) {
                newIsCalled = true;
                strictEqual(actualAssert, expectedAssert);
                return newIs;
            }
        }
    );

    // Exercise SUT...
    var actualIs = assert.is.defined();

    // Verify SUT...
    strictEqual(assertDefinedCalled, true, "assertDefinedCalled");
    strictEqual(newIsCalled, true, "newIsCalled");
    strictEqual(actualIs, newIs);

    // Fixture teardown...
});

test("defined: error when undefined", function () {

    // Fixture setup...
    var assert = cbc.assert.param("param");

    // Exercise and verify SUT...
    raises(function () {
        assert.is.defined();
    }, function (e) {
        return e.message === "Parameter param must be specified.";
    });

    // Fixture teardown...
});

test("defined: nothing when specified", function () {

    // Fixture setup...
    var assert = cbc.assert.param("param", "value");

    // Exercise and verify SUT...
    assert.is.defined();

    // Fixture teardown...
});

test("notNull: calls assertNotNull and newIs w args", function () {

    // Fixture setup...
    var assertNotNullCalled = false;
    var newIsCalled = false;
    var expectedAssert = "notNull";
    var newIs = "theNewIs";
    var assert = Ext.apply(
        new cbc.private.assert.assert("param", "value"), 
        {
            assertNotNull: function () {
                assertNotNullCalled = true;
            },
            newIs: function (actualAssert) {
                newIsCalled = true;
                strictEqual(actualAssert, expectedAssert);
                return newIs;
            }
        }
    );

    // Exercise SUT...
    var actualIs = assert.is.notNull();

    // Verify SUT...
    strictEqual(assertNotNullCalled, true, "assertNotNullCalled");
    strictEqual(newIsCalled, true, "newIsCalled");
    strictEqual(actualIs, newIs);

    // Fixture teardown...
});

test("bool: calls assertValueOfType and newIs w args", function () {

    // Fixture setup...
    var assertValueOfTypeCalled = false;
    var newIsCalled = false;
    var expectedAssert = "bool";
    var newIs = "theNewIs";
    var assert = Ext.apply(
        new cbc.private.assert.assert("param", "value"), 
        {
            assertValueOfType: function (actualType) {
                assertValueOfTypeCalled = true;
                strictEqual(actualType, "boolean");
            },
            newIs: function (actualAssert) {
                newIsCalled = true;
                strictEqual(actualAssert, expectedAssert);
                return newIs;
            }
        }
    );

    // Exercise SUT...
    var actualIs = assert.is.bool();

    // Verify SUT...
    strictEqual(assertValueOfTypeCalled, true, "assertValueOfTypeCalled");
    strictEqual(newIsCalled, true, "newIsCalled");
    strictEqual(actualIs, newIs);

    // Fixture teardown...
});

test("bool: error when not type", function () {

    // Fixture setup...
    var assert = cbc.assert.param("param", 1);

    // Exercise and verify SUT...
    raises(function () {
        assert.is.bool();
    }, function (e) {
        return e.message === "Parameter param must be of type boolean.";
    });

    // Fixture teardown...
});

test("bool: nothing when type", function () {

    // Fixture setup...
    var assert = cbc.assert.param("param", true);

    // Exercise and verify SUT...
    assert.is.bool();

    // Fixture teardown...
});

test("func: calls assertValueOfType and newIs w args", function () {

    // Fixture setup...
    var assertValueOfTypeCalled = false;
    var newIsCalled = false;
    var expectedAssert = "func";
    var newIs = "theNewIs";
    var assert = Ext.apply(
        new cbc.private.assert.assert("param", "value"), 
        {
            assertValueOfType: function (actualType) {
                assertValueOfTypeCalled = true;
                strictEqual(actualType, "function");
            },
            newIs: function (actualAssert) {
                newIsCalled = true;
                strictEqual(actualAssert, expectedAssert);
                return newIs;
            }
        }
    );

    // Exercise SUT...
    var actualIs = assert.is.func();

    // Verify SUT...
    strictEqual(assertValueOfTypeCalled, true, "assertValueOfTypeCalled");
    strictEqual(newIsCalled, true, "newIsCalled");
    strictEqual(actualIs, newIs);

    // Fixture teardown...
});

test("func: error when not type", function () {

    // Fixture setup...
    var assert = cbc.assert.param("param", 1);

    // Exercise and verify SUT...
    raises(function () {
        assert.is.func();
    }, function (e) {
        return e.message === "Parameter param must be of type function.";
    });

    // Fixture teardown...
});

test("func: nothing when type", function () {

    // Fixture setup...
    var assert = cbc.assert.param("param", function () {});

    // Exercise and verify SUT...
    assert.is.func();

    // Fixture teardown...
});

test("number: calls assertValueOfType and newIs w args", function () {

    // Fixture setup...
    var assertValueOfTypeCalled = false;
    var newIsCalled = false;
    var expectedAssert = "number";
    var newIs = "theNewIs";
    var assert = Ext.apply(
        new cbc.private.assert.assert("param", "value"), 
        {
            assertValueOfType: function (actualType) {
                assertValueOfTypeCalled = true;
                strictEqual(actualType, "number");
            },
            newIs: function (actualAssert) {
                newIsCalled = true;
                strictEqual(actualAssert, expectedAssert);
                return newIs;
            }
        }
    );

    // Exercise SUT...
    var actualIs = assert.is.number();

    // Verify SUT...
    strictEqual(assertValueOfTypeCalled, true, "assertValueOfTypeCalled");
    strictEqual(newIsCalled, true, "newIsCalled");
    strictEqual(actualIs, newIs);

    // Fixture teardown...
});

test("number: error when not type", function () {

    // Fixture setup...
    var assert = cbc.assert.param("param", false);

    // Exercise and verify SUT...
    raises(function () {
        assert.is.number();
    }, function (e) {
        return e.message === "Parameter param must be of type number.";
    });

    // Fixture teardown...
});

test("number: nothing when type", function () {

    // Fixture setup...
    var assert = cbc.assert.param("param", 0);

    // Exercise and verify SUT...
    assert.is.number();

    // Fixture teardown...
});

test("object: calls assertValueOfType and newIs w args", function () {

    // Fixture setup...
    var assertValueOfTypeCalled = false;
    var newIsCalled = false;
    var expectedAssert = "object";
    var newIs = "theNewIs";
    var assert = Ext.apply(
        new cbc.private.assert.assert("param", "value"), 
        {
            assertValueOfType: function (actualType) {
                assertValueOfTypeCalled = true;
                strictEqual(actualType, "object");
            },
            newIs: function (actualAssert) {
                newIsCalled = true;
                strictEqual(actualAssert, expectedAssert);
                return newIs;
            }
        }
    );

    // Exercise SUT...
    var actualIs = assert.is.object();

    // Verify SUT...
    strictEqual(assertValueOfTypeCalled, true, "assertValueOfTypeCalled");
    strictEqual(newIsCalled, true, "newIsCalled");
    strictEqual(actualIs, newIs);

    // Fixture teardown...
});

test("object: error when not type", function () {

    // Fixture setup...
    var assert = cbc.assert.param("param", false);

    // Exercise and verify SUT...
    raises(function () {
        assert.is.object();
    }, function (e) {
        return e.message === "Parameter param must be of type object.";
    });

    // Fixture teardown...
});

test("object: nothing when type", function () {

    // Fixture setup...
    var assert = cbc.assert.param("param", {});

    // Exercise and verify SUT...
    assert.is.object();

    // Fixture teardown...
});

test("string: calls assertValueOfType and newIs w args", function () {

    // Fixture setup...
    var assertValueOfTypeCalled = false;
    var newIsCalled = false;
    var expectedAssert = "string";
    var newIs = "theNewIs";
    var assert = Ext.apply(
        new cbc.private.assert.assert("param", "value"), 
        {
            assertValueOfType: function (actualType) {
                assertValueOfTypeCalled = true;
                strictEqual(actualType, "string");
            },
            newIs: function (actualAssert) {
                newIsCalled = true;
                strictEqual(actualAssert, expectedAssert);
                return newIs;
            }
        }
    );

    // Exercise SUT...
    var actualIs = assert.is.string();

    // Verify SUT...
    strictEqual(assertValueOfTypeCalled, true, "assertValueOfTypeCalled");
    strictEqual(newIsCalled, true, "newIsCalled");
    strictEqual(actualIs, newIs);

    // Fixture teardown...
});

test("string: error when not type", function () {

    // Fixture setup...
    var assert = cbc.assert.param("param", false);

    // Exercise and verify SUT...
    raises(function () {
        assert.is.string();
    }, function (e) {
        return e.message === "Parameter param must be of type string.";
    });

    // Fixture teardown...
});

test("string: nothing when type", function () {

    // Fixture setup...
    var assert = cbc.assert.param("param", "string");

    // Exercise and verify SUT...
    assert.is.string();

    // Fixture teardown...
});

test("notEmpty: calls assertValueOfType and newIs w args", function () {

    // Fixture setup...
    var assertNotEmptyStringCalled = false;
    var newIsCalled = false;
    var expectedAssert = "notEmpty";
    var newIs = "theNewIs";
    var tmp = new cbc.private.assert.assert("param", "value");
    var is = tmp.is.string().and;
    var assert = Ext.apply(tmp, 
        {
            assertNotEmptyString: function () {
                assertNotEmptyStringCalled = true;
            },
            newIs: function (actualAssert) {
                newIsCalled = true;
                strictEqual(actualAssert, expectedAssert);
                return newIs;
            }
        }
    ).and;

    // Exercise SUT...
    var actualIs = is.notEmpty();

    // Verify SUT...
    strictEqual(assertNotEmptyStringCalled, true, "assertNotEmptyStringCld");
    strictEqual(newIsCalled, true, "newIsCalled");
    strictEqual(actualIs, newIs);

    // Fixture teardown...
});