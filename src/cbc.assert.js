/// <reference path="cbc.ns.js" />

window.cbc = window.cbc || {};

(function (p, $) {

    p.typeAsserts = [ "bool", "func", "number", "object", "string" ];

    p.and = function (newIs) {
        /// <field name="and" type="Object">
        /// A list of more assertions to apply.
        /// </field>
        this.and = newIs;
    };

    p.assert = function (param, value) {
        /// <summary>
        /// Constructs a new assert.
        /// </summary>
        /// <param name="param" type="String">
        /// The name of the parameter to assert.
        /// </param>
        /// <param name="value">
        /// The value of the parameter to assert.
        /// </param>

        this.param = param;
        this.value = value;
        this.stack = [];
        var priv = this;

        function defined () {
            /// <summary>
            /// Asserts that the parameter is defined.
            /// That means that it has been specified
            /// so that it's value is not undefined.
            /// </summary>
            priv.assertDefined();
            return priv.newIs("defined");
        }

        function notNull () {
            /// <summary>
            /// Asserts that the parameter is not null.
            /// </summary>
            priv.assertNotNull();
            return priv.newIs("notNull");
        }

        function bool () {
            /// <summary>
            /// Asserts that the parameter is of type boolean.
            /// </summary>
            priv.assertValueOfType("boolean");
            return priv.newIs("bool");
        }

        function func () {
            /// <summary>
            /// Asserts that the parameter is of type function.
            /// </summary>
            priv.assertValueOfType("function");
            return priv.newIs("func");
        }

        function number () {
            /// <summary>
            /// Asserts that the parameter is of type number.
            /// </summary>
            priv.assertValueOfType("number");
            return priv.newIs("number");
        }

        function object () {
            /// <summary>
            /// Asserts that the parameter is of type object.
            /// </summary>
            priv.assertValueOfType("object");
            return priv.newIs("object");
        }

        function string () {
            /// <summary>
            /// Asserts that the parameter is of type string.
            /// </summary>
            priv.assertValueOfType("string");
            return priv.newIs("string");
        }

        this.notEmpty = function () {
            /// <summary>
            /// Asserts that the parameter is not empty string.
            /// </summary>
            priv.assertNotEmptyString();
            return priv.newIs("notEmpty");
        };

        this.is = {
            defined: defined,
            notNull: notNull,
            bool: bool,
            func: func,
            number: number,
            object: object,
            string: string
        };
    };

    p.assert.prototype = {

        assertDefined: function () {
            /// <summary>
            /// Asserts specified value is defined.
            /// </summary>
            if (typeof this.value === "undefined") {
                throw new Error([
                    "Parameter", this.param, "must be specified."
                ].join(" "));
            }
        },

        assertNotNull: function () {
            /// <summary>
            /// Asserts specified value is not null.
            /// </summary>
            if (this.value === null) {
                throw new Error([
                    "Parameter", this.param, "must not be null."
                ].join(" "));
            }
        },

        assertValueOfType: function (type) {
            /// <summary>
            /// Asserts specified value is of specified type.
            /// </summary>
            var undefinedOrNull =
                typeof this.value === "undefined" || this.value === null;
            if (!undefinedOrNull && typeof this.value !== type) {
                throw new Error([
                    "Parameter", this.param, "must be of type", type + "."
                ].join(" "));
            }
        },

        assertNotEmptyString: function () {
            /// <summary>
            /// Asserts specified value is of type String,
            /// and it has String value which is not an
            /// empty String.
            /// </summary>
            if (typeof this.value === "string") {
                if (this.value.length === 0) {
                    throw new Error([
                        "Parameter", this.param, "must not be empty string."
                    ].join(" "));
                }
            }
        },

        newIs: function (assert) {
            /// <summary>
            /// Removes assertions no longer required.
            /// </summary>
            this.stack.push(assert);
            var newIs = {};
            for (var assertion in this.is) {
                newIs[assertion] = this.is[assertion];
            }
            var stackLength = this.stack.length;
            for (var i = 0; i < stackLength; i++) {
                var assertion = this.stack[i];
                switch (assertion) {
                    case "defined":
                        delete newIs.defined;
                        break;
                    case "notNull":
                        delete newIs.notNull;
                        break;
                    case "string":
                        newIs.notEmpty = this.notEmpty;
                    case "bool":
                    case "func":
                    case "number":
                    case "object":
                        for (var j = 0; j < p.typeAsserts.length; j++) {  
                            delete newIs[p.typeAsserts[j]];
                        }
                        break;
                    case "notEmpty":
                        delete newIs.notEmpty;
                        break;
                }
            }
            var numAsserts = 0;
            for (var key in newIs) {
                numAsserts++;
            }
            if (numAsserts > 0) {
                return new p.and(newIs);
            }
            return null;
        }
    };

    cbc.assert = {};

    cbc.assert.that = cbc.assert;

    cbc.assert.param = function (name, value) {
        /// <summary>
        /// Creates a new assert.
        /// </summary>
        /// <param name="name" type="String">
        /// The name of the parameter to assert.
        /// </param>
        /// <param name="value">
        /// The value of the parameter to assert.
        /// </param>
        new p.assert("name", name).is
            .defined()
            .and.notNull()
            .and.string()
            .and.notEmpty();
        return new function () {
            /// <field name="is" type="Object">
            /// A list of assertions to apply.
            /// </field>
            this.is = new p.assert(name, value).is
        };
    };

    $ && ($.assert = cbc.assert);

})(cbc.priv && (cbc.priv.assert = {}) || {}, window.jQuery);