module("kkj.evt");

test("Deferred: constructor: no jq, kkj object", function () {

    // Fixture setup ...
            
    // Exercise SUT ...
    var deferred = new kkj.evt.Deferred();

    // Verify SUT ...
    ok(deferred);
});

test("Deferred: always, error", function () {

    // Fixture setup ...
    var deferred = new kkj.evt.Deferred();
            
    // Exercise and verify SUT ...
    raises(function () {
        deferred.always();
    });
});

test("Deferred: state: initial pending", function () {

    // Fixture setup ...
    var deferred = new kkj.evt.Deferred();
            
    // Exercise SUT ...
    var state = deferred.state();

    // Verify SUT ...
    ok(state, "pending");
});

test("Deferred: then with no arg, error", function () {

    // Fixture setup ...
    var deferred = new kkj.evt.Deferred();
            
    // Exercise and verify SUT ...
    raises(function () {
        deferred.then();
    });
});

test("Deferred: then with array arg, error", function () {

    // Fixture setup ...
    var deferred = new kkj.evt.Deferred();
            
    // Exercise and verify SUT ...
    raises(function () {
        deferred.then([]);
    });
});

test("Deferred: then with two args, error", function () {

    // Fixture setup ...
    var deferred = new kkj.evt.Deferred();
            
    // Exercise and verify SUT ...
    raises(function () {
        deferred.then(function () {}, true);
    });
});

test("Deferred: then: returns deferred", function () {

    // Fixture setup ...
    var deferred = new kkj.evt.Deferred();
            
    // Exercise SUT ...
    var actualDeferred = deferred.then(function () {});

    // Verify SUT...
    strictEqual(actualDeferred, deferred);
});

test("Deferred: resolve: callback called with args", function () {

    // Fixture setup ...
    var expectedArg1 = 1;
    var expectedArg2 = 2;
    var called = false;
    var deferred = new kkj.evt.Deferred();
    deferred.then(function (actualArg1, actualArg2) {
        called = true;
        strictEqual(actualArg1, expectedArg1);
        strictEqual(actualArg2, expectedArg2);
    });
            
    // Exercise SUT ...
    deferred.resolve(expectedArg1, expectedArg2);

    // Verify SUT ...
    ok(called);
});

test("Deferred: resolve: state resolved", function () {

    // Fixture setup ...
    var deferred = new kkj.evt.Deferred();
            
    // Exercise SUT ...
    deferred.resolve();

    // Verify SUT ...
    strictEqual(deferred.state(), "resolved");
});

test("Deferred: resolve: second call ignored", function () {

    // Fixture setup ...
    var numberOfCalls = 0;
    var deferred = new kkj.evt.Deferred();
    deferred.then(function () {
        numberOfCalls++;
    });
            
    // Exercise SUT ...
    deferred.resolve();
    deferred.resolve();

    // Verify SUT ...
    strictEqual(numberOfCalls, 1);
});

test("Deferred: resolve: returns deferred", function () {

    // Fixture setup ...
    var deferred = new kkj.evt.Deferred();
            
    // Exercise SUT ...
    var actualDeferred = deferred.resolve();

    // Verify SUT ...
    strictEqual(actualDeferred, deferred);
});

test("Deferred: then: callback called w args when resolved", function () {

    // Fixture setup ...
    var arg = 1;
    var called = false;
    var deferred = new kkj.evt.Deferred();
    deferred.resolve(arg);

    // Exercise SUT ...
    deferred.then(function (actualArg) {
        called = true;
        strictEqual(actualArg, arg);
    });
            
    // Verify SUT ...
    ok(called);
});

test("Deferred: promise, arg, error", function () {

    // Fixture setup ...
    var deferred = new kkj.evt.Deferred();
            
    // Exercise and verify SUT ...
    raises(function () {
        deferred.promise(true);
    });
});

test("Deferred: promise, then can access callback array", function () {

    // Fixture setup ...
    var deferred = new kkj.evt.Deferred();

    //  Exercise SUT ...
    var promise = deferred.promise();
            
    // Verify SUT ...
    promise.then(function () {});
});

test("Deferred: promise, has state, no resolve", function () {

    // Fixture setup ...
    var deferred = new kkj.evt.Deferred();

    //  Exercise SUT ...
    var promise = deferred.promise();
            
    // Verify SUT ...
    strictEqual(promise.state(), "pending");
    ok(typeof promise.resolve, "undefined");
});