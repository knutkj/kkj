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