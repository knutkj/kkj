/// <reference path="cbc.ns.js" />
/// <reference path="cbc.assert.js" />

window.cbc = window.cbc || {};

window.cbc.__namespace = true;

cbc.parse = (function (priv) {

    priv.__namespace = true;

    var trimPattern =
        /^\s*|\s*$/g;
    var funcPattern =
        /^\s*function\s*([^\s(]*)\s*\(([^)]*)/;
    var funcPattern2 =
        /^\s*([^\s]+)\s*:\s+function\s*\(([^)]*)/;
    var docLinePattern =
        /^\/\/\/\s*(.*)$/;


    // ------------------------------------------------------------------------
    // FuncInfo object

    function FuncInfo (func) {
        /// <summary>
        /// Initializes a new FuncInfo object for the
        /// specified function.
        /// </summary>
        /// <param name="func" type="Function">
        /// The function to get information for.
        /// </param>
        // <returns type="cbc.parse.FuncInfo">
        // The initialized FuncInfo object.
        // </returns>
        var nfo = p.parseFunc(func);

        function get_name () {
            /// <summary>
            /// Get the name of the function.
            /// </summary>
            /// <returns type="String">
            /// The name of the function.
            /// </returns>
            return nfo.name;
        }

        function get_summary () {
            /// <summary>
            /// Get the function's documentation summary.
            /// </summary>
            /// <returns type="String">
            /// The function's documentation summary.
            /// </returns>
            return nfo.summary;
        }

        function get_params () {
            /// <summary>
            /// Get the parameter information list.
            /// </summary>
            /// <returns type="Array"
            ///     elementType="cbc.priv.parse.ParamInfo">
            /// The parameter information list.
            /// </returns>
            return nfo.params;
        }

        function get_returnType () {
            /// <summary>
            /// Get the type the function returns.
            /// </summary>
            /// <returns type="String">
            /// The type the function returns.
            /// </returns>
            return nfo.returnType;
        }

        function get_returnDesc () {
            /// <summary>
            /// Get the function's return description.
            /// </summary>
            /// <returns type="String">
            /// The function's return description.
            /// </returns>
            return nfo.returnDesc;
        }

        this.get_name = get_name;
        this.get_summary = get_summary;
        this.get_params = get_params;
        this.get_returnType = get_returnType;
        this.get_returnDesc = get_returnDesc;
    }

    FuncInfo.__class = true;    

    function toString () {
        /// <summary>
        /// Returns API help for the function represented by this
        /// FuncInfo object in a PowerShell Cmdlet help kind of way.
        /// </summary>
        /// <returns type="String">
        /// API help for the function represented by this FuncInfo
        /// object.
        /// </returns>
        var returnType = this.get_returnType();
        var returnSyntax = returnType ? "<" + returnType + "> " : "";
        var params = [];
        var paramsHelp = [];
        var paramNfos = this.get_params();
        var numParamNfos = paramNfos.length;
        for (var i = 0; i < numParamNfos; i++) {
            var paramNfo = paramNfos[i];
            params.push(paramNfo.get_type() + " " + paramNfo.get_name());
            paramsHelp.push(
                "    " + paramNfo.toString().replace("\n", "\n    ")
            );
        }
        return [
            "NAME\n",
            "    ", this.get_name(), "\n\n",
            "SYNOPSIS\n",
            "    ", this.get_summary().replace("\n", "\n    "), "\n\n",
            "SYNTAX\n",
            "    ", returnSyntax, this.get_name(), 
                "(", params.join(", "), ")\n\n",
            "PARAMETERS\n",
            paramsHelp.join("\n\n"), "\n\n",
            "OUTPUTS\n",
            "    ", returnSyntax.replace(trimPattern, ""), "\n",
            "        ", (this.get_returnDesc() || "").replace("\n", "\n        ")
        ].join("");
    }

    FuncInfo.prototype = {

        toString: toString

    };


    // ------------------------------------------------------------------------
    // ParamInfo object

    var ParamInfo = (function () {

        function get_name () {
            /// <summary>
            /// Get the name of the parameter.
            /// </summary>
            /// <returns type="String">
            /// The name of the parameter.
            /// </returns>
            return this._name;
        }

        function get_type () {
            /// <summary>
            /// Get the type of the parameter.
            /// </summary>
            /// <returns type="String">
            /// The type of the parameter.
            /// </returns>
            return this._type;
        }

        function get_mayBeNull () {
            /// <summary>
            /// Get a boolean value indicating if
            /// the parameter may be null or not.
            /// </summary>
            /// <remarks>
            /// The default value is false.
            /// </remarks>
            /// <returns type="Boolean">
            /// True if the parameter may be null or false.
            /// </returns>
            return this._mayBeNull;
        }

        function get_optional () {
            /// <summary>
            /// Get a boolean value indicating if
            /// the parameter is optional or not.
            /// </summary>
            /// <remarks>
            /// The default value is false.
            /// </remarks>
            /// <returns type="Boolean">
            /// True if the parameter is optional or false.
            /// </returns>
            return this._optional;
        }

        function get_desc () {
            /// <summary>
            /// Get the parameter's description.
            /// </summary>
            /// <returns type="String">
            /// The parameter's description.
            /// </returns>
            return this._desc;
        }

        function toString () {
            /// <summary>
            /// Presents the ParamInfo in a PowerShell
            /// parameter help kind of way.
            /// </summary>
            /// <returns type="String">
            /// API help for the parameter.
            /// </returns>
            return [
                "-", this.get_name(), " <", this.get_type(), ">", "\n",
                "    ", this.get_desc()
            ].join("");
        }

        function ParamInfo (info) {
            /// <summary>
            /// Initalizes a new ParamInfo instance
            /// with the specified parameter information.
            /// </summary>
            /// <param name="info" type="Object">
            /// An object with Parameter information.
            /// Valid properties are:&#10;
            ///  &#8226; String name: The name of the parameter&#10;
            ///  &#8226; [String type = null]: The type of the parameter&#10;
            ///  &#8226; [Boolean mayBeNull = false]: True if the
            /// parameter may be null, or false otherwise&#10;
            ///  &#8226; [Boolean optional = false]: True if it is
            /// optional to specify the parameter, or false otherwise&#10;
            ///  &#8226; [String desc = null]: Parameter description
            /// </param>
            //// <returns type="cbc.parse.ParamInfo">
            //// The initialized ParamInfo object.
            //// </returns>
            info = info || {};
            this._name = info.name;
            this._type = info.type || null;
            this._mayBeNull = info.mayBeNull || false;
            this._optional = info.optional || false;
            this._desc = info.desc || null;
        }

        ParamInfo.__class = true;
    
        ParamInfo.prototype = {

            constructor: ParamInfo,
            get_name: get_name,
            get_type: get_type,
            get_mayBeNull: get_mayBeNull,
            get_optional: get_optional,
            get_desc: get_desc,
            toString: toString

        };

        return ParamInfo;
    
    })();

    // ------------------------------------------------------------------------

    function getDoc (funcString) {
        /// <summary>
        /// Get the function's API documentation.
        /// </summary>
        /// <param name="funcString" type="String">
        /// The result of a function's toString.
        /// </param>
        /// <returns type="String">
        /// The function's API documentation.
        /// </returns>
        var bodyString =
            this.stripFuncDeclaration && 
            this.stripFuncDeclaration(funcString) ||
            p.stripFuncDeclaration(funcString);
        var lines = bodyString.split("\n");
        var numLines = lines.length;
        var docLines = [];
        for (var i = 0; i < numLines; i++) {
            var line = lines[i].replace(trimPattern, "");
            var res = docLinePattern.exec(line);
            if (res !== null) {
                docLines.push(res[1]);
            } else {
                break;
            }
        }
        return docLines.join("\n").replace(trimPattern, "") || null;
    }

    var p = (priv.parse = {

        ParamInfo: ParamInfo,
        FuncInfo: FuncInfo,

        funcPattern: funcPattern,
        funcPattern2: funcPattern2,

        parseFunc: function (func) {
            /// <summary>
            /// Parses the specified function.
            /// </summary>
            /// <param name="func" type="Function">
            /// The function to parse.
            /// </param>
            var funcString = func.toString();
            var res = 
                funcPattern.exec(funcString) ||
                funcPattern2.exec(funcString);
            var doc = this.getDoc(funcString);
            var parsedDoc = this.parseDoc(doc);
            var numParamDoc = parsedDoc.params.length;
            var params = [];
            var paramList = res[2];
            var parsedParams = this.parseParamList(paramList);
            for (var i = 0; i < func.length; i++) {
                var param = parsedParams[i];
                var paramDoc;
                for (var j = 0; j < numParamDoc; j++) {
                    var tmp = parsedDoc.params[j];
                    if (tmp.name === param) {
                        paramDoc = tmp;
                        break;
                    }
                }
                params.push(new this.ParamInfo(paramDoc || { 
                    name: param
                }));
            }
            return {
                name: res[1] || null,
                summary: parsedDoc.summary || "",
                params: params,
                returnType: parsedDoc.returnType,
                returnDesc: parsedDoc.returnDesc
            };
        },

        getDoc: getDoc,

        stripFuncDeclaration: function (funcString) {
            /// <summary>
            /// Strips away the function declaration.
            /// </summary>
            /// <param name="funcString">
            /// The result of a function's toString.
            /// </param>
            /// <returns type="String">
            /// The function's toString without the declaration.
            /// </returns>
            return funcString
                .replace(this.funcPattern, "")
                .replace(this.funcPattern2, "")
                .replace(/^\s*\)\s*\{\s*/, "");
        },

        parseDoc: function (doc) {
            /// <summary>
            /// Parses the specified documentation.
            /// </summary>
            doc = doc || "";
            var div = document.createElement("div");
            div.innerHTML = this.replaceParam(doc);

            var summaryElement = div.getElementsByTagName("summary")[0];
            var summary = summaryElement && 
                summaryElement.innerText.replace(trimPattern, "") || null;

            var params = [];
            var paramElements = div.getElementsByTagName("parameter");
            var numParams = paramElements.length;
            for (var i = 0; i < numParams; i++) {
                var paramElement = paramElements[i];
                var optional = (paramElement.
                    getAttribute("optional") || "").toLowerCase();
                var mayBeNull = (paramElement.
                    getAttribute("mayBeNull") || "").toLowerCase();
                var description =
                    paramElement.innerText.replace(trimPattern, "");
                var param = {
                    name: paramElement.getAttribute("name"),
                    type: paramElement.getAttribute("type") || null,
                    optional: optional === "true",
                    mayBeNull: mayBeNull === "true",
                    desc: description || null
                };
                params.push(param);
            }

            var returnType;
            var returnDesc;
            var returnsElements = div.getElementsByTagName("returns");
            if (returnsElements.length === 1) {
                returnsElement = returnsElements[0];
                returnType = returnsElement.getAttribute("type");
                returnDesc = 
                    returnsElement.innerText.replace(trimPattern, "");
            }

            return {
                summary: summary,
                params: params,
                returnType: returnType || null,
                returnDesc: returnDesc || null
            };
        },

        replaceParam: function (doc) {
            /// <summary>
            /// Replaces param elements with parameter elements.
            /// </summary>
            return doc
                .replace(/(<)(param)([^>]*>)/g, "$1parameter$3")
                .replace(/<\/param>/g, "</parameter>");
        },

        parseParamList: function (paramList) {
            /// <summary>
            /// Parses the specified parameter list.
            /// </summary>
            /// <param name="params" type="String">
            /// A comma separated list of parameters.
            /// </param>
            /// <returns type="Array">
            /// A list of parsed parameters.
            /// </returns>
            var fixedParamList = paramList.replace(/\s/g, "");
            if (fixedParamList) { 
                return fixedParamList.split(",");
            }
            return [];
        }
    });

    priv.parse.__namespace = true;

    // ------------------------------------------------------------------------

    var parse = {};
    parse.__namespace = true;

    function func (func) {
        /// <summary>
        /// Parses the specified function.
        /// </summary>
        /// <param name="func" type="Function">
        /// The function to parse.
        /// </param>
        cbc.assert.param("func", func)
            .is.defined().and.notNull().and.func();

        return new p.FuncInfo(func);
    }

    parse.func = func;
    parse.getDoc = p.getDoc;
    parse.ParamInfo = p.ParamInfo;

    return parse;

})(cbc.priv || {});