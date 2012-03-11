/// <reference path="https://ajax.googleapis.com/ajax/libs/ext-core/3.1.0/ext-core.js" />
/// <reference path="qunit.js" />
/// <reference path="cbc.ns.js" />
/// <reference path="cbc.priv.js" />
/// <reference path="cbc.parse.js" />

module("cbc.priv.parse");

test("funcPattern: space in params", function () {

    // Fixture setup...
    var src = "function (a, b, c) {";
    
    // Exercise SUT...
    var res = cbc.priv.parse.funcPattern.exec(src);
    
    // Verify SUT...
    notStrictEqual(res, null);
    strictEqual(res[2], "a, b, c");
    
    // Fixture teardown...
});

test("funcPattern: no space before curly brac", function () {

    // Fixture setup...
    var src = 'function (d,e,b){if(b){Ext.apply(d,b)}if(d&&e&&typeof e=="object"){for(var a in e){d[a]=e[a]}}return d}';
    
    // Exercise SUT...
    var res = cbc.priv.parse.funcPattern.exec(src);
    
    // Verify SUT...
    notStrictEqual(res, null);
    strictEqual(res[1], "");
    strictEqual(res[2], "d,e,b");
    
    // Fixture teardown...
});

test("funcPattern: name with colon", function () {

    // Fixture setup...
    var src = "bound: function ()"
    
    // Exercise SUT...
    var res = cbc.priv.parse.funcPattern2.exec(src);
    
    // Verify SUT...
    notStrictEqual(res, null);
    strictEqual(res[1], "bound");
    strictEqual(res[2], "");
    
    // Fixture teardown...
});

function parseFuncCtx () {
    return { 
        getDoc: function () {},
        parseDoc: function () { return { params: [] }; },
        parseParamList: function () {},
        ParamInfo: function () {}
    };
}

test("parseFunc: finds func name", function () {

    // Fixture setup...
    function func () {}
    var ctx = parseFuncCtx();
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseFunc.call(ctx, func);
    
    // Verify SUT...
    strictEqual(res.name, "func");
    
    // Fixture teardown...
});

test("parseFunc: finds func name when new line", function () {

    // Fixture setup...
    eval("function func\n() {}");
    var ctx = parseFuncCtx();
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseFunc.call(ctx, func);
    
    // Verify SUT...
    strictEqual(res.name, "func");
    
    // Fixture teardown...
});

test("parseFunc: finds func name when tab", function () {

    // Fixture setup...
    eval("function func\u0009() {}");
    var ctx = parseFuncCtx();
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseFunc.call(ctx, func);
    
    // Verify SUT...
    strictEqual(res.name, "func");
    
    // Fixture teardown...
});

test("parseFunc: no func name, null", function () {

    // Fixture setup...
    var func = function () {};
    var ctx = parseFuncCtx();
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseFunc.call(ctx, func);
    
    // Verify SUT...
    strictEqual(res.name, null);
    
    // Fixture teardown...
});

test("parseFunc: no func summary, emtpy string", function () {

    // Fixture setup...
    var func = function () {};
    var ctx = parseFuncCtx();
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseFunc.call(ctx, func);
    
    // Verify SUT...
    strictEqual(res.summary, "");
    
    // Fixture teardown...
});

test("parseFunc: creates empty param list", function () {

    // Fixture setup...
    function f () {};
    var ctx = parseFuncCtx();
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseFunc.call(ctx, f);
    
    // Verify SUT...
    strictEqual(res.params.length, 0);
    
    // Fixture teardown...
});

test("parseFunc: calls getDoc, parseDoc, parseParamList", function () {

    // Fixture setup...
    function f (a,b) {}
    var expectedFuncString = f.toString();
    var parseDocCalled = false;
    var getDocCalled = false;
    var expectedDoc = "doc";
    var expectedParams = "a,b";
    var parseParamListCalled = false;
    var expectedSummary = "summary";
    var expectedReturnType = "returnType";
    var expectedReturnDesc = "returnDesc";
    var ctx = Ext.apply(parseFuncCtx(), {
        getDoc: function (actualFuncString) {
            getDocCalled = true;
            strictEqual(actualFuncString, expectedFuncString);
            return expectedDoc;
        },
        parseDoc: function (actualDoc) {
            parseDocCalled = true;
            strictEqual(actualDoc, expectedDoc);
            return { 
                summary: expectedSummary, 
                params: [],
                returnType: expectedReturnType,
                returnDesc: expectedReturnDesc
            };
        },
        parseParamList: function (actualParams) {
            parseParamListCalled = true;
            strictEqual(actualParams, expectedParams);
            return [];
        }
    });
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseFunc.call(ctx, f);
    
    // Verify SUT...
    strictEqual(getDocCalled, true, "getDocCalled");
    strictEqual(parseDocCalled, true, "parseDocCalled");
    strictEqual(parseParamListCalled, true, "parseParamListCalled");
    strictEqual(res.summary, expectedSummary);
    strictEqual(res.returnType, expectedReturnType);
    strictEqual(res.returnDesc, expectedReturnDesc);
    
    
    // Fixture teardown...
});

test("parseFunc: creates first param", function () {

    // Fixture setup...
    var ctorCalled = false;
    var expectedName = "param";
    var expectedDoc = {
        name: expectedName,
        type: "type",
        mayBeNull: "mayBeNull",
        optional: "optional",
        desc: "desc"
    };
    var ctx = Ext.apply(parseFuncCtx(), {
        parseDoc: function () {
            return { params: [ expectedDoc ] };
        },
        ParamInfo: function (args) {
            ctorCalled = true;
            strictEqual(args.name, expectedName);
            strictEqual(args.type, expectedDoc.type);
            strictEqual(args.mayBeNull, expectedDoc.mayBeNull);
            strictEqual(args.optional, expectedDoc.optional);
            strictEqual(args.desc, expectedDoc.desc);
        },
        parseParamList: function () {
            return [ expectedName ];
        }
    });
    function f (param) {};
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseFunc.call(ctx, f);
    
    // Verify SUT...
    strictEqual(ctorCalled, true, "ctorCalled");
    strictEqual(res.params.length, 1);
    var param = res.params[0];
    strictEqual(param instanceof ctx.ParamInfo, true);
    
    // Fixture teardown...
});

test("parseFunc: creates second param", function () {

    // Fixture setup...
    var expectedName = "b";
    var expectedDesc = "desc";
    function f (a,b) {
        ///<param name="b">desc</param>
    };
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseFunc(f);
    
    // Verify SUT...
    strictEqual(res.params.length, 2);
    var param = res.params[1];
    strictEqual(param.get_name(), expectedName);
    strictEqual(param.get_desc(), expectedDesc);
    
    // Fixture teardown...
});

test("parseParamList: no params, emtpy array", function () {

    // Fixture setup...
    var params = "";
    
    // Exercise SUT...
    var list = cbc.priv.parse.parseParamList(params);
    
    // Verify SUT...
    strictEqual(list.length, 0);
    
    // Fixture teardown...
});

test("parseParamList: one parameter, returned", function () {

    // Fixture setup...
    var param = " theParameter  ";
    
    // Exercise SUT...
    var list = cbc.priv.parse.parseParamList(param);
    
    // Verify SUT...
    strictEqual(list.length, 1);
    strictEqual(list[0], "theParameter");
    
    // Fixture teardown...
});

test("parseParamList: two parameters, both returned", function () {

    // Fixture setup...
    var param = " theParameter , theSecond ";
    
    // Exercise SUT...
    var list = cbc.priv.parse.parseParamList(param);
    
    // Verify SUT...
    strictEqual(list.length, 2);
    strictEqual(list[0], "theParameter");
    strictEqual(list[1], "theSecond");
    
    // Fixture teardown...
});

test("getDoc: invalid func string, throws", function () {

    // Exercise and verify SUT...
    raises(function () {
        cbc.parse.getDoc();
    }, function (e) {
        return e.message === "Parameter funcString must be specified.";
    });
    
    // Fixture teardown...
});

test("getDoc: no strip in context, uses closure p", function () {

    // Fixture setup...
    var old = cbc.priv.parse.stripFuncDeclaration;
    var stripCalled = false;
    var expectedString = "";
    cbc.priv.parse.stripFuncDeclaration = function (actualString) {
        stripCalled = true;
        strictEqual(actualString, expectedString);
        return "";
    };
    
    // Exercise SUT...
    cbc.priv.parse.getDoc.call({}, expectedString);
    
    // Verify SUT...
    strictEqual(stripCalled, true, "stripCalled");
    
    // Fixture teardown...
    cbc.priv.parse.stripFuncDeclaration = old;
});

test("getDoc: calls stripFuncDeclaration, works", function () {

    // Fixture setup...
    var expFuncString = " /// foo \n///bar\na";
    var stripFuncDeclarationCalled = false;
    var ctx = {
        stripFuncDeclaration: function (actualFuncString) {
            stripFuncDeclarationCalled = true;
            strictEqual(actualFuncString, expFuncString);
            return " /// bar\n///foo\na"
        }
    };
    
    // Exercise SUT...
    var actualDoc = cbc.priv.parse.getDoc.call(ctx, expFuncString);
    
    // Verify SUT...
    strictEqual(stripFuncDeclarationCalled, true);
    strictEqual(actualDoc, "bar\nfoo");
    
    // Fixture teardown...
});

test("getDoc: skips doc for members", function () {

    // Fixture setup...
    var docSrc = " /// foo \n///bar\na\n///bla"
    
    // Exercise SUT...
    var doc = cbc.priv.parse.getDoc(docSrc);
    
    // Verify SUT...
    strictEqual(doc, "foo\nbar");
    
    // Fixture teardown...
});

test("getDoc: handles func decl over some lines", function () {

    // Fixture setup...
    var docSrc = "function (\nfoo,\nbar\n)\n {/// foo \n///bar"
    
    // Exercise SUT...
    var doc = cbc.priv.parse.getDoc(docSrc);
    
    // Verify SUT...
    strictEqual(doc, "foo\nbar");
    
    // Fixture teardown...
});

test("getDoc: empty doc with nl, null", function () {

    // Fixture setup...
    var docSrc = "function ()\n {///\n///\n"
    
    // Exercise SUT...
    var doc = cbc.priv.parse.getDoc(docSrc);
    
    // Verify SUT...
    strictEqual(doc, null);
    
    // Fixture teardown...
});

test("stripFuncDeclaration: works", function () {

    // Fixture setup...
    var funcString = "function foo (\n    bar\n)\n{\n\n    ///";
    
    // Exercise SUT...
    var res = cbc.priv.parse.stripFuncDeclaration(funcString);
    
    // Verify SUT...
    strictEqual(res, "///");
    
    // Fixture teardown...
});

test("stripFuncDeclaration: works for func alt 2", function () {

    // Fixture setup...
    var funcString = " foo : function (\n    bar\n)\n{\n\n    ///";
    
    // Exercise SUT...
    var res = cbc.priv.parse.stripFuncDeclaration(funcString);
    
    // Verify SUT...
    strictEqual(res, "///");
    
    // Fixture teardown...
});

test("parseDoc: no doc, works", function () {

    // Fixture setup...
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseDoc();
    
    // Verify SUT...
    notStrictEqual(res, null);
    strictEqual(typeof res, "object");
    
    // Fixture teardown...
});

test("parseDoc: calls replaceParam", function () {

    // Fixture setup...
    var old = document.createElement;
    var element = {
        getElementsByTagName: function () {
            return [];
        }
    };
    document.createElement = function (nodeName) {
        return element;
    };
    var originalDoc = "fakeDoc";
    var expectedDoc = "doc";
    var replaceParamCalled = false;
    var context = {
        replaceParam: function (actualDoc) {
            replaceParamCalled = true;
            strictEqual(actualDoc, originalDoc);
            return expectedDoc;
        }
    };
    
    // Exercise SUT...
    cbc.priv.parse.parseDoc.call(context, originalDoc);
    
    // Verify SUT...
    strictEqual(replaceParamCalled, true, "replaceParamCalled");
    strictEqual(element.innerHTML, expectedDoc);
    
    // Fixture teardown...
    document.createElement = old;
});

test("parseDoc: summary, summary element returned", function () {

    // Fixture setup...
    var doc = "<summary>doc</summary>";
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseDoc(doc);
    
    // Verify SUT...
    strictEqual(res.summary, "doc");
    
    // Fixture teardown...
});

test("parseDoc: trims summary", function () {

    // Fixture setup...
    var doc = "<summary>\n doc   \t\n </summary>";
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseDoc(doc);
    
    // Verify SUT...
    strictEqual(res.summary, "doc");
    
    // Fixture teardown...
});

test("parseDoc: no summary, null", function () {

    // Fixture setup...
    var doc = "";
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseDoc(doc);
    
    // Verify SUT...
    strictEqual(res.summary, null);
    
    // Fixture teardown...
});

test("parseDoc: param, info parsed", function () {

    // Fixture setup...
    var doc = [
        '<param name="param" type="String" optional="false"',
            'mayBeNull="true">',
            "description",
        '</param>'
    ].join("\n");
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseDoc(doc);
    
    // Verify SUT...
    strictEqual(res.params.length, 1);
    var param = res.params[0];
    strictEqual(param.name, "param");
    strictEqual(param.type, "String");
    strictEqual(param.optional, false);
    strictEqual(param.mayBeNull, true);
    strictEqual(param.desc, "description");
    
    // Fixture teardown...
});

test("parseDoc: param, min info parsed", function () {

    // Fixture setup...
    var doc = '<param name="param2"></param>';
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseDoc(doc);
    
    // Verify SUT...
    strictEqual(res.params.length, 1);
    var param = res.params[0];
    strictEqual(param.name, "param2");
    strictEqual(param.type, null);
    strictEqual(param.optional, false);
    strictEqual(param.mayBeNull, false);
    strictEqual(param.desc, null);
    
    // Fixture teardown...
});

test("parseDoc: no returns, null returns vals", function () {

    // Fixture setup...
    var doc = "";
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseDoc(doc);
    
    // Verify SUT...
    strictEqual(res.returnType, null);
    strictEqual(res.returnDesc, null);
    
    // Fixture teardown...
});

test("parseDoc: returns parsed", function () {

    // Fixture setup...
    var doc = '<returns type="DaType">desc</returns>';
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseDoc(doc);
    
    // Verify SUT...
    strictEqual(res.returnType, "DaType");
    strictEqual(res.returnDesc, "desc");
    
    // Fixture teardown...
});

test("parseDoc: returnDesc trimmed", function () {

    // Fixture setup...
    var doc = '<returns> desc\n </returns>';
    
    // Exercise SUT...
    var res = cbc.priv.parse.parseDoc(doc);
    
    // Verify SUT...
    strictEqual(res.returnType, null);
    strictEqual(res.returnDesc, "desc");
    
    // Fixture teardown...
});

test("replaceParam: works", function () {

    // Fixture setup...
    var doc1 = '<param>param</param>';
    var doc2 = '<param foo="bar">param</param>';
    var doc3 = '<param>param</param><param\n></param>';
    
    // Exercise SUT...
    var res1 = cbc.priv.parse.replaceParam(doc1);
    var res2 = cbc.priv.parse.replaceParam(doc2);
    var res3 = cbc.priv.parse.replaceParam(doc3);
    
    // Verify SUT...
    strictEqual(res1, '<parameter>param</parameter>');
    strictEqual(res2, '<parameter foo="bar">param</parameter>');
    strictEqual(res3,
        '<parameter>param</parameter><parameter\n></parameter>'
    );
    
    // Fixture teardown...
});

// ----------------------------------------------------------------------------

module("cbc.parse.FuncInfo");

test("ctor: asserts info is object", function () {

    // Exercise and verify SUT...
    raises(function () {
        new cbc.parse.FuncInfo();
    }, function (e) {
        return e.message === "Parameter info must be specified.";
    });
    
    // Fixture teardown...
});

test("ctor: sets props", function () {

    // Fixture setup...
    var props = {
        name: "name",
        summary: "summary",
        params: [],
        returnType: "returnType",
        returnDesc: "returnDesc"
    };
    
    // Exercise SUT...
    var nfo = new cbc.parse.FuncInfo(props);
    
    // Verify SUT...
    strictEqual(nfo._name, props.name);
    strictEqual(nfo._summary, props.summary);
    strictEqual(nfo._params, props.params);
    strictEqual(nfo._returnType, props.returnType);
    strictEqual(nfo._returnDesc, props.returnDesc);
    
    // Fixture teardown...
});

test("ctor: sets defaults", function () {

    // Fixture setup...
    var props = { name: "name" };
    
    // Exercise SUT...
    var nfo = new cbc.parse.FuncInfo(props);
    
    // Verify SUT...
    strictEqual(nfo._name, props.name);
    strictEqual(nfo._summary, null);
    strictEqual(Ext.isArray(nfo._params), true);
    strictEqual(nfo._returnType, null);
    strictEqual(nfo._returnDesc, null);
    
    // Fixture teardown...
});

test("get_name: returns this._name", function () {

    // Fixture setup...
    var get_name = cbc.parse.FuncInfo.prototype.get_name;
    var expectedName = "funcName";
    var ctx = { _name: expectedName };
    
    // Exercise SUT...
    var actualName = get_name.call(ctx);
    
    // Verify SUT...
    strictEqual(actualName, expectedName);
    
    // Fixture teardown...
});

test("get_summary: returns this._summary", function () {

    // Fixture setup...
    var get_summary = cbc.parse.FuncInfo.prototype.get_summary;
    var expectedSummary = "summary";
    var ctx = { _summary: expectedSummary };
    
    // Exercise SUT...
    var actualSummary = get_summary.call(ctx);
    
    // Verify SUT...
    strictEqual(actualSummary, expectedSummary);
    
    // Fixture teardown...
});

test("get_params: returns this._params", function () {

    // Fixture setup...
    var get_params = cbc.parse.FuncInfo.prototype.get_params;
    var expectedParams = "expectedParams";
    var ctx = { _params: expectedParams };
    
    // Exercise SUT...
    var actualParams = get_params.call(ctx);
    
    // Verify SUT...
    strictEqual(actualParams, expectedParams);
    
    // Fixture teardown...
});

test("get_returnType: returns this.returnType", function () {

    // Fixture setup...
    var get_returnType = cbc.parse.FuncInfo.prototype.get_returnType;
    var expectedReturnType = "returnType";
    var ctx = { _returnType: expectedReturnType };
    
    // Exercise SUT...
    var actualReturnType = get_returnType.call(ctx);
    
    // Verify SUT...
    strictEqual(actualReturnType, expectedReturnType);
    
    // Fixture teardown...
});

test("get_returnDesc: returns this.returnDesc", function () {

    // Fixture setup...
    var get_returnDesc = cbc.parse.FuncInfo.prototype.get_returnDesc;
    var expectedReturnDesc = "returnDesc";
    var ctx = { _returnDesc: expectedReturnDesc };
    
    // Exercise SUT...
    var actualReturnDesc = get_returnDesc.call(ctx);
    
    // Verify SUT...
    strictEqual(actualReturnDesc, expectedReturnDesc);
    
    // Fixture teardown...
});

test("toString: nice string", function () {

    // Fixture setup...
    function f (a) {
        /// <summary>summary</summary>
        /// <param name="a" type="Function">desc</param>
        /// <returns type="String">returnDesc</returns>
    }
    var expectedNfoString = [
        "NAME",
        "    f",
        "",
        "SYNOPSIS",
        "    summary",
        "",
        "SYNTAX",
        "    <String> f(Function a)",
        "",
        "PARAMETERS",
        "    -a <Function>",
        "        desc",
        "",
        "OUTPUTS",
        "    <String>",
        "        returnDesc"
    ].join("\n");
    var nfo = cbc.parse.func(f);
    
    // Exercise SUT...
    var actualNfoString = nfo.toString();
    
    // Verify SUT...
    strictEqual(actualNfoString, expectedNfoString);
    
    // Fixture teardown...
});

test("toString: no returns, nice string", function () {

    // Fixture setup...
    function f (a) {
        /// <summary>summary</summary>
        /// <param name="a" type="Function">desc</param>
    }
    var expectedNfoString = [
        "NAME",
        "    f",
        "",
        "SYNOPSIS",
        "    summary",
        "",
        "SYNTAX",
        "    f(Function a)",
        "",
        "PARAMETERS",
        "    -a <Function>",
        "        desc",
        "",
        "OUTPUTS",
        "    ",
        "        "
    ].join("\n");
    var nfo = cbc.parse.func(f);
    
    // Exercise SUT...
    var actualNfoString = nfo.toString();
    
    // Verify SUT...
    strictEqual(actualNfoString, expectedNfoString);
    
    // Fixture teardown...
});

// ----------------------------------------------------------------------------

module("cbc.parse.ParamInfo");

test("ctor: asserts info is object", function () {

    // Exercise and verify SUT...
    raises(function () {
        new cbc.parse.ParamInfo();
    }, function (e) {
        return e.message === "Parameter info must be specified.";
    });
    
    // Fixture teardown...
});

test("ctor: sets props", function () {

    // Fixture setup...
    var props = {
        name: "name",
        type: "String",
        mayBeNull: true,
        optional: true,
        desc: "Desc"
    };
    
    // Exercise SUT...
    var nfo = new cbc.parse.ParamInfo(props);

    // Verify SUT...
    strictEqual(nfo._name, props.name);
    strictEqual(nfo._type, props.type);
    strictEqual(nfo._mayBeNull, props.mayBeNull);
    strictEqual(nfo._optional, props.optional);
    strictEqual(nfo._desc, props.desc);
    
    // Fixture teardown...
});

test("ctor: sets defaults", function () {

    // Fixture setup...
    var props = {
        name: "name"
    };
    
    // Exercise SUT...
    var nfo = new cbc.parse.ParamInfo(props);
    
    // Verify SUT...
    strictEqual(nfo._name, props.name);
    strictEqual(nfo._type, null);
    strictEqual(nfo._mayBeNull, false);
    strictEqual(nfo._optional, false);
    strictEqual(nfo._desc, null);
    
    // Fixture teardown...
});

test("get_name: returns this._name", function () {

    // Fixture setup...
    var get_name = cbc.parse.ParamInfo.prototype.get_name;
    var expectedName = "theParamName";
    var ctx = { _name: expectedName };
    
    // Exercise SUT...
    var actualName = get_name.call(ctx);
    
    // Verify SUT...
    strictEqual(actualName, expectedName);
    
    // Fixture teardown...
});

test("get_type: returns this._type", function () {

    // Fixture setup...
    var get_type = cbc.parse.ParamInfo.prototype.get_type;
    var expectedType = "String";
    var ctx = { _type: expectedType };
    
    // Exercise SUT...
    var actualType = get_type.call(ctx);
    
    // Verify SUT...
    strictEqual(actualType, expectedType);
    
    // Fixture teardown...
});

test("get_desc: returns this._desc", function () {

    // Fixture setup...
    var get_desc = cbc.parse.ParamInfo.prototype.get_desc;
    var expectedDesc = "desc";
    var ctx = { _desc: expectedDesc };
    
    // Exercise SUT...
    var actualDesc = get_desc.call(ctx);
    
    // Verify SUT...
    strictEqual(actualDesc, expectedDesc);
    
    // Fixture teardown...
});

test("get_mayBeNull: returns this._mayBeNull", function () {

    // Fixture setup...
    var get_mayBeNull = cbc.parse.ParamInfo.prototype.get_mayBeNull;
    var ctx = { _mayBeNull: true };
    
    // Exercise SUT...
    var optional = get_mayBeNull.call(ctx);
    
    // Verify SUT...
    strictEqual(optional, true);
    
    // Fixture teardown...
});

test("get_optional: true specified, true", function () {

    // Fixture setup...
    var get_optional = cbc.parse.ParamInfo.prototype.get_optional;
    var ctx = { _optional: true };
    
    // Exercise SUT...
    var optional = get_optional.call(ctx);
    
    // Verify SUT...
    strictEqual(optional, true);
    
    // Fixture teardown...
});

test("toString: all info, nice string", function () {

    // Fixture setup...
    function f (a) {
        /// <param name="a" type="String">desc for a</param>
    }
    var funcNfo = cbc.parse.func(f);
    var expectedString = [
        "-a <String>",
        "    desc for a"
    ].join("\n");
    
    // Exercise SUT...
    var actualString = funcNfo.get_params()[0].toString();
    
    // Verify SUT...
    strictEqual(actualString, expectedString);
    
    // Fixture teardown...
});

// ----------------------------------------------------------------------------

module("cbc.parse");

test("func: invalid arg, error", function () {

    // Fixture setup...
    
    // Exercise and verify SUT...
    raises(function () {
        cbc.parse.func();
    }, function (e) {
        return e.message === "Parameter func must be specified.";
    });
    raises(function () {
        cbc.parse.func(null);
    }, function (e) {
        return e.message === "Parameter func must not be null.";
    });
    raises(function () {
        cbc.parse.func(1);
    }, function (e) {
        return e.message === "Parameter func must be of type function.";
    });
    
    // Fixture teardown...
});

test("func: calls parseFunc and creates FuncInfo", function () {

    // Fixture setup...
    var old = cbc.priv.parse.parseFunc;
    var expectedFunc = function f () {};
    var parseFuncCalled = true;
    var expectedFuncInfo = "nfo";
    var ctorCalled = false;
    cbc.priv.parse.parseFunc = function (actualFunc) {
        parseFuncCalled = true;
        strictEqual(actualFunc, expectedFunc);
        return expectedFuncInfo;
    };
    var ctx = {
        FuncInfo: function (actualFuncInfo) {
            ctorCalled = true;
            strictEqual(actualFuncInfo, expectedFuncInfo);
        }
    };
    
    // Exercise SUT...
    var nfo = cbc.parse.func.call(ctx, expectedFunc);
    
    // Verify SUT...
    strictEqual(parseFuncCalled, true, "parseFuncCalled");
    strictEqual(ctorCalled, true, "ctorCalled");
    strictEqual(nfo instanceof ctx.FuncInfo, true);
    
    // Fixture teardown...
    cbc.priv.parse.parseFunc = old;
});

test("getDoc: same as priv getDoc", function () {
    
    // Verify SUT...
    strictEqual(
        cbc.parse.getDoc,
        cbc.priv.parse.getDoc
    );
    
    // Fixture teardown...
});

function createDocumentation (func) {
    var res = cbc.parse.func(func);
    var doc = [
        "\n== Constructors ==",
        "\n=== " + res.get_name() + " ===\n",
        "<pre>", res.toString(), "</pre>",
        "\n== Methods =="
    ];
    var instance = new func(res);
    for (var funcName in instance) {
        var prop = instance[funcName];
        if (typeof prop === "function")
            doc.push(
                "\n=== " + funcName + " ===\n",
                "<pre>",
                cbc.parse.func(prop).toString(),
                "</pre>"
            ); 
    }
    console.log(doc.join("\n"));
}