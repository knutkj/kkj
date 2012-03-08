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
    var expectedDoc = { name: expectedName };
    var ctx = Ext.apply(parseFuncCtx(), {
        parseDoc: function () {
            return { params: [ expectedDoc ] };
        },
        ParamInfo: function (args) {
            ctorCalled = true;
            strictEqual(args.name, expectedName);
            strictEqual(args.doc, expectedDoc);
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
    strictEqual(param.description, "description");
    
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
    strictEqual(param.description, "");
    
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

module("cbc.priv.parse.FuncInfo");

test("ctor: calls parseFunc with func", function () {

    // Fixture setup...
    var old = cbc.priv.parse.parseFunc;
    function func () {};
    var parseFuncCalled = false;
    cbc.priv.parse.parseFunc = function (actualFunc) {
        parseFuncCalled = true;
        strictEqual(actualFunc, func);
    };
    
    // Exercise SUT...
    new cbc.priv.parse.FuncInfo(func);
    
    // Verify SUT...
    strictEqual(parseFuncCalled, true);
    
    // Fixture teardown...
    cbc.priv.parse.parseFunc = old;
});

test("get_name: returns parsed name", function () {

    // Fixture setup...
    var old = cbc.priv.parse.parseFunc;
    var parseFuncCalled = false;
    var expectedName = "funcName";
    cbc.priv.parse.parseFunc = function () {
        return { name: expectedName };
    };
    var nfo = new cbc.priv.parse.FuncInfo(function f () {});
    
    // Exercise SUT...
    var actualName = nfo.get_name();
    
    // Verify SUT...
    strictEqual(actualName, expectedName);
    
    // Fixture teardown...
    cbc.priv.parse.parseFunc = old;
});

test("get_summary: returns parsed summary", function () {

    // Fixture setup...
    var old = cbc.priv.parse.parseFunc;
    var parseFuncCalled = false;
    var expectedSummary = "summary";
    cbc.priv.parse.parseFunc = function () {
        return { summary: expectedSummary };
    };
    var nfo = new cbc.priv.parse.FuncInfo(function f () {});
    
    // Exercise SUT...
    var actualSummary = nfo.get_summary();
    
    // Verify SUT...
    strictEqual(actualSummary, expectedSummary);
    
    // Fixture teardown...
    cbc.priv.parse.parseFunc = old;
});

test("get_params: returns parsed params", function () {

    // Fixture setup...
    var old = cbc.priv.parse.parseFunc;
    var parseFuncCalled = false;
    var expectedParams = "expectedParams";
    cbc.priv.parse.parseFunc = function () {
        return { params: expectedParams };
    };
    var nfo = new cbc.priv.parse.FuncInfo(function f () {});
    
    // Exercise SUT...
    var actualParams = nfo.get_params();
    
    // Verify SUT...
    strictEqual(actualParams, expectedParams);
    
    // Fixture teardown...
    cbc.priv.parse.parseFunc = old;
});

test("get_returnType: returns return type", function () {

    // Fixture setup...
    var old = cbc.priv.parse.parseFunc;
    var parseFuncCalled = false;
    var expectedReturnType = "returnType";
    cbc.priv.parse.parseFunc = function () {
        return { returnType: expectedReturnType };
    };
    var nfo = new cbc.priv.parse.FuncInfo(function f () {});
    
    // Exercise SUT...
    var actualReturnType = nfo.get_returnType();
    
    // Verify SUT...
    strictEqual(actualReturnType, expectedReturnType);
    
    // Fixture teardown...
    cbc.priv.parse.parseFunc = old;
});

test("get_returnDesc: returns the return description", function () {

    // Fixture setup...
    var old = cbc.priv.parse.parseFunc;
    var parseFuncCalled = false;
    var expectedReturnDesc = "returnDesc";
    cbc.priv.parse.parseFunc = function () {
        return { returnDesc: expectedReturnDesc };
    };
    var nfo = new cbc.priv.parse.FuncInfo(function f () {});
    
    // Exercise SUT...
    var actualReturnDesc = nfo.get_returnDesc();
    
    // Verify SUT...
    strictEqual(actualReturnDesc, expectedReturnDesc);
    
    // Fixture teardown...
    cbc.priv.parse.parseFunc = old;
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

module("cbc.priv.parse.ParamInfo");

test("get_name: returns name specified in ctor", function () {

    // Fixture setup...
    var expectedName = "theParamName";
    var param = new cbc.priv.parse.ParamInfo({
        name: expectedName
    });
    
    // Exercise SUT...
    var actualName = param.get_name();
    
    // Verify SUT...
    strictEqual(actualName, expectedName);
    
    // Fixture teardown...
});

test("get_name: no args, emty", function () {

    // Fixture setup...
    var param = new cbc.priv.parse.ParamInfo();
    
    // Exercise SUT...
    var actualName = param.get_name();
    
    // Verify SUT...
    strictEqual(actualName, "");
    
    // Fixture teardown...
});

test("get_type: returns type specified in ctor", function () {

    // Fixture setup...
    var expectedType = "String";
    var param = new cbc.priv.parse.ParamInfo({
        doc: { type: expectedType }
    });
    
    // Exercise SUT...
    var actualType = param.get_type();
    
    // Verify SUT...
    strictEqual(actualType, expectedType);
    
    // Fixture teardown...
});

test("get_type: no type specified, null", function () {

    // Fixture setup...
    var param = new cbc.priv.parse.ParamInfo();
    
    // Exercise SUT...
    var actualType = param.get_type();
    
    // Verify SUT...
    strictEqual(actualType, null);
    
    // Fixture teardown...
});

test("get_desc: returns desc specified in ctor", function () {

    // Fixture setup...
    var expectedDesc = "desc";
    var param = new cbc.priv.parse.ParamInfo({
        doc: { description: expectedDesc }
    });
    
    // Exercise SUT...
    var actualDesc = param.get_desc();
    
    // Verify SUT...
    strictEqual(actualDesc, expectedDesc);
    
    // Fixture teardown...
});

test("get_desc: no doc, empty", function () {

    // Fixture setup...
    var expectedDesc = "desc";
    var param = new cbc.priv.parse.ParamInfo({});
    
    // Exercise SUT...
    var actualDesc = param.get_desc();
    
    // Verify SUT...
    strictEqual(actualDesc, "");
    
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

test("func: create FuncInfo", function () {

    // Fixture setup...
    var old = cbc.priv.parse.FuncInfo;
    var ctorCalled = false;
    var expectedFunc = function f () {};
    cbc.priv.parse.FuncInfo = function (actualFunc) {
        ctorCalled = true;
        strictEqual(actualFunc, expectedFunc);
    };
    
    // Exercise SUT...
    var nfo = cbc.parse.func(expectedFunc);
    
    // Verify SUT...
    strictEqual(ctorCalled, true, "ctorCalled");
    strictEqual(nfo instanceof cbc.priv.parse.FuncInfo, true);
    
    // Fixture teardown...
    cbc.priv.parse.FuncInfo = old;
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
    var instance = new func(function () {});
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