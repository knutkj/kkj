﻿/// <reference path="cbc.ns.js" />
/// <reference path="cbc.assert.js" />
/// <reference path="cbc.parse.js" />

window.cbc = cbc || {};

(function (priv) {

    var p = (priv.contract = {

        contracts: [],

        Contract: function (func) {
            /// <summary>
            /// Initalizes a new Contract instance
            /// for the specified function.
            /// </summary>

            this.getFuncInfo = function () {
                /// <summary>
                /// Get the contract's function.
                /// </summary>
                /// <return type="Function">
                /// The contract's function.
                /// </return>
                return func;
            };
        }
    });

    // ------------------------------------------------------------------------

    cbc.contract = {};

    cbc.contract.__namespace = true;

    var paramPattern = /^[^(]+\(([^)]*)/;

    function wrap (func) {
        /// <summary>
        /// Wraps the function inside a contract.
        /// </summary>
        /// <returns type="Function">
        /// The wrapped function.
        /// </returns>
        var funcInfo = cbc.parse.func(func);
        var params = funcInfo.get_params();
        var numParams = params.length;
        var wrapper = function (args) {
            /// doc
            for (var i = 0; i < numParams; i++) {
                var param = params[i];
                var paramType = param.get_type();
                if (paramType !== null) {
                    var assert = cbc.assert
                        .param(param.get_name(), arguments[i])
                        .is;
                    switch (paramType.toLowerCase()) {
                        case "boolean":
                            assert.bool();
                            break;
                        case "function":
                            assert.func();
                            break;
                        case "number":
                            assert.number();
                            break;
                        case "object":
                            assert.object();
                            break;
                        case "string":
                            assert.string();
                            break;
                    }
                }
            }
            func.apply(this, arguments);
        }
        var funcString = func.toString();
        var doc = "///" +
            cbc.parse.getDoc(funcString).split("\n").join("");
        var newFunc;
        var newFuncString = wrapper
            .toString()
            .replace("args", paramPattern.exec(funcString)[1])
            .replace("/// doc", doc);
        eval("newFunc = " + newFuncString);


        
        return newFunc;
    }

    cbc.contract.forFunc = function (func) {
        /// <summary>
        /// Creates a new contract for the specified function.
        /// </summary>
        /// <param name="func" type="Function">
        /// The function to create the contract for.
        /// </param>
        /// <returns>
        /// The created contract.
        /// </returns>
        cbc.assert.param("func", func)
            .is.defined().and.notNull().and.func();
        var contract = new p.Contract(func);
        p.contracts.push(contract);
        return contract;
    };

    cbc.contract.all = function () {
        /// <summary>Get all cotracts.</summary>
        return p.contracts;
    };

    cbc.contract.wrap = wrap;

})(cbc.priv || {});

function createSettingsObject (props) {
    var o = {};
    for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        var name = prop.name;
        var sName = "set_" + name;
        var type = prop.type;
        var doc = props[i].doc;
        o[sName] = new Function("value", [
            "/// <summary>Sets the " + name + " property.</summary>",
            '/// <param name="value" type="' + type + '">' + doc + '</param>',
            "this." + name + " = value;",
            '//delete o["set' + name + '"];',
            "var fixed = {};",
            "for (var prop in this) {",
            "if (prop !== '" + sName + "') { fixed[prop] = this[prop]; }}",
            "return fixed;"
        ].join("\n"));
    }
    return o;
}

function _param (name) {
    this.name = name;
    this.props = [];
}

_param.prototype = {
    add: function (prop) {
        this.props.push(prop);
        return this;
    },
    forFunction: function (func) {
        (func.params || (func.params = {}))[this.name] = this;
        return this;
    }
};

function createParam (name) {
    return new _param(name);
}

function _prop (name) {
    this.name = name;
}

_prop.prototype = {
    ofType: function (type) {
        this.type = type;
        return this;
    },
    withDoc: function (doc) {
        this.doc = doc;
        return this;
    }
};

function prop (name) {
    return new _prop(name);
}

function callFunction (func) {
    var params = func.params;
    return {
        withParam: function () {
            var o = {};
            for (var paramName in params) {
                var param = params[paramName];
                o[paramName] = createSettingsObject(param.props);
                o[paramName].done = function () {
                    return func(this);
                };
            }
            return o;
        }
    }
}

function createObject (func) {
    var params = func.params;
    return {
        withParam: function () {
            var o = {};
            for (var paramName in params) {
                var param = params[paramName];
                o[paramName] = createSettingsObject(param.props);
                o[paramName].done = function () {
                    return new func(this);
                };
            }
            return o;
        }
    }
}

// ----------------------

function createSettingsObject (props) {
    var o = {};
    for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        var name = prop.name;
        var sName = "set_" + name;
        var type = prop.type;
        var doc = props[i].doc;
        o[sName] = new Function("value", [
            "/// <summary>Sets the " + name + " property.</summary>",
            '/// <param name="value" type="' + type + '">' + doc + '</param>',
            "this." + name + " = value;",
            '//delete o["set' + name + '"];',
            "var fixed = {};",
            "for (var prop in this) {",
            "if (prop !== '" + sName + "') { fixed[prop] = this[prop]; }}",
            "return fixed;"
        ].join("\n"));
    }
    return o;
}

function _param (name) {
    this.name = name;
    this.props = [];
}

_param.prototype = {
    add: function (prop) {
        this.props.push(prop);
        return this;
    },
    forFunction: function (func) {
        (func.params || (func.params = {}))[this.name] = this;
        return this;
    }
};

function createParam (name) {
    return new _param(name);
}

function _prop (name) {
    this.name = name;
}

_prop.prototype = {
    ofType: function (type) {
        this.type = type;
        return this;
    },
    withDoc: function (doc) {
        this.doc = doc;
        return this;
    }
};

function prop (name) {
    return new _prop(name);
}

function callFunction (func) {
    var params = func.params;
    return {
        withParam: function () {
            var o = {};
            for (var paramName in params) {
                var param = params[paramName];
                o[paramName] = createSettingsObject(param.props);
                o[paramName].done = function () {
                    return func(this);
                };
            }
            return o;
        }
    }
}

function createObject (func) {
    var params = func.params;
    return {
        withParam: function () {
            var o = {};
            for (var paramName in params) {
                var param = params[paramName];
                o[paramName] = createSettingsObject(param.props);
                o[paramName].done = function () {
                    return new func(this);
                };
            }
            return o;
        }
    }
}

//var props = [
//    prop("url")
//        .type("String")
//        .doc("A string containing the URL to which the request is sent."),
//    prop("data")
//        .type("String")
//        .doc("Data to be sent to the server.")
//    //{ name: "Url", doc: "Get the url bla bla" },
//    //{ name: "Data", doc: "bla foo bar" }
//];

//var ajax = function (settings) {
//    alert([settings.url, settings.data]);
//};
//
//var param = createParam("settings")
//    .add(prop("url").ofType("string").withDoc("AJAX Request URL."))
//    .add(prop("data").ofType("object").withDoc("Data to send to server."))
//    .forFunction(ajax);
//
//callFunction(ajax)
//    .withParam()
//        .settings
//            .set_data("data is data")
//            .set_url("the url")
//    .done();

function person (props) {
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.toString = function () {
        return this.lastName + ", " + this.firstName;
    };
}

createParam("props")
    .add(prop("firstName").ofType("string").withDoc("First name."))
    .add(prop("lastName").ofType("string").withDoc("Last name."))
    .forFunction(person);

var knut = createObject(person)
    .withParam()
        .props
            .set_firstName("Knut")
            .set_lastName("Johansen")
    .done();

//alert(knut);

function summer (ledd) {

    //alert(ledd.en + ledd.to);

}

createParam("ledd")
    .add(prop("en").ofType("number").withDoc("Første ledd."))
    .add(prop("to").ofType("number").withDoc("Andre ledd."))
    .forFunction(summer);

callFunction(summer).withParam().ledd.set_en(1).set_to(2).done();

//callFunction(ajax).withParam()
//    .settings
//        .set_url()
//        .set_data()
//    .done();



//var o = createSettingsObject(props);


//o.setData(



//alert(o.Data);