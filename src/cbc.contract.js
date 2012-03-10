/// <reference path="cbc.ns.js" />
/// <reference path="cbc.priv.js" />
/// <reference path="cbc.assert.js" />
/// <reference path="cbc.parse.js" />

window.cbc = cbc || {};

cbc.contract = (function (priv) {

    function assertionString (paramInfo) {
        /// <summary>
        /// Creates an assertion string for the specified parameter.
        /// </summary>
        /// <param name="paramInfo" type="cbc.parse.ParamInfo">
        /// Information about the parameter to create the assertion for.
        /// </param>
        /// <returns type="String">
        /// The assertion in string format.
        /// </returns>
        var assertions = [];
        if (!paramInfo.get_optional()) {
            assertions.push("defined()");
        }
        if (!paramInfo.get_mayBeNull()) {
            assertions.push("notNull()");
        }
        if (paramInfo.get_type() !== null) {
            assertions.push(
                paramInfo
                    .get_type()
                    .toLocaleLowerCase()
                    .replace("function", "func")
                    .replace("boolean", "bool") + "()"
            );
        }
        if (assertions.length > 0) {
            var name = paramInfo.get_name();
            return [
                'cbc.assert.param("', name, '", ', name, ").is.",
                assertions.join(".and."), ";"
            ].join("");
        }
        return "";
    }

    var p = (priv.contract = {

        contracts: [],
        assertionString: assertionString
    });

    priv.contract.__namespace = true;

    // ------------------------------------------------------------------------

    var paramPattern = /^[^(]+\(([^)]*)/;
    var docPattern = /^\s+\/\/ assertions.*/m;

    var Contract = (function () {

        function get_contract () {
            /// <summary>
            /// Get the contract associated with this function.
            /// </summary>
            /// <returns type="cbc.contract.Contract" />
            return this._contract;
        }

        function get_func () {
            /// <summary>
            /// Get function this contract has been created for.
            /// </summary>
            /// <returns type="Function">
            /// The contract's function.
            /// </returns>
            return this._func;
        };

        function get_funcInfo () {
            /// <summary>
            /// Get information about the function this
            /// contract has been created for.
            /// </summary>
            /// <returns type="cbc.parse.FuncInfo">
            /// Information about the function.
            /// </returns>
            return this._funcInfo;
        };

        function Contract (func) {
            /// <summary>
            /// Initalizes a new Contract instance for the
            /// specified function.
            /// </summary>
            /// <param name="func" type="Function">
            /// The function to create a contract for.
            /// </param>
            /// <returns type="cbc.contract.Contract">
            /// The initialized contract.
            /// </returns>
            this._func = func;
            this._funcInfo = cbc.parse.func(func);
            p.contracts.push(this);
            func._contract = this;
            func.get_contract = get_contract;
        }

        Contract.__class = true;

        Contract.prototype = {
            constructor: Contract,
            get_func: get_func,
            get_funcInfo: get_funcInfo
        };

        return Contract;
    })();

    function get_func () {
        /// <summary>Get the wrapped function.</summary>
        /// <returns type="Function" />
        return this._func;
    }

    function wrap (func) {
        /// <summary>
        /// Wraps the specified function inside a contract.
        /// </summary>
        /// <param name="func" type="Function">
        /// The function to wrap inside a contract.
        /// </param>
        /// <returns type="Function">
        /// The wrapped function.
        /// </returns>
        var funcString = func.toString();
        var doc = cbc.parse.getDoc(funcString);
        if (!doc) {
            return func;
        }
        var docComment = doc.split("\n").join("\n///");
        var contract = new cbc.contract.Contract(func);        
        var funcInfo = contract.get_funcInfo();
        var params = funcInfo.get_params();
        var numParams = params.length;
        var assertions = [];
        for (var i = 0; i < numParams; i++) {
            assertions.push(p.assertionString(params[i]));
        }
        var newFuncString = [
            "function (" + paramPattern.exec(funcString)[1] + ") {",
                "///" + docComment,
                assertions.join("\n"),
                "func.apply(this, arguments);",
            "}"
        ].join("\n");
        eval("var newFunc = " + newFuncString);
        newFunc._func = func;
        newFunc.get_func = get_func;
        return newFunc;
    }

    function all () {
        /// <summary>Get all contracts.</summary>
        /// <returns type="Array">
        /// All the contracts.
        /// </returns>
        return p.contracts;
    };

    return {
        __namespace: true,
        Contract: Contract,
        all: all,
        wrap: wrap
    };

})(cbc.priv || {});