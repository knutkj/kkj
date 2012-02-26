/// <reference path="cbc.ns.js" />
/// <reference path="cbc.assert.js" />

window.cbc = cbc || {};

(function (priv) {

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
        /// <returns type="FuncInfo">
        /// The initialized FuncInfo object.
        /// </returns>
        var nfo = p.parseFunc(func);

        function getName () {
            /// <summary>
            /// Get the name of the function.
            /// </summary>
            /// <returns type="String">
            /// The name of the function.
            /// </returns>
            return nfo.name;
        }

        function getSummary () {
            /// <summary>
            /// Get the function's documentation summary.
            /// </summary>
            /// <returns type="String">
            /// The function's documentation summary.
            /// </returns>
            return nfo.summary;
        }

        function getParams () {
            /// <summary>
            /// Get the parameter information list.
            /// </summary>
            /// <returns type="Array">
            /// The parameter information list.
            /// </returns>
            return nfo.params;
        }

        function getReturnType () {
            /// <summary>
            /// Get the type the function returns.
            /// </summary>
            /// <returns type="String">
            /// The type the function returns.
            /// </returns>
            return nfo.returnType;
        }

        function getReturnDesc () {
            /// <summary>
            /// Get the function's return description.
            /// </summary>
            /// <returns type="String">
            /// The function's return description.
            /// </returns>
            return nfo.returnDesc;
        }

        this.getName = getName;
        this.getSummary = getSummary;
        this.getParams = getParams;
        this.getReturnType = getReturnType;
        this.getReturnDesc = getReturnDesc;
    }

    function toString () {
        /// <summary>
        /// Returns API help for the function represented by this
        /// FuncInfo object in a PowerShell Cmdlet help kind of way.
        /// </summary>
        /// <returns type="String">
        /// API help for the function represented by this FuncInfo
        /// object.
        /// </returns>
        var returnType = this.getReturnType();
        var returnSyntax = returnType ? "<" + returnType + "> " : "";
        var params = [];
        var paramsHelp = [];
        var paramNfos = this.getParams();
        var numParamNfos = paramNfos.length;
        for (var i = 0; i < numParamNfos; i++) {
            var paramNfo = paramNfos[i];
            params.push(paramNfo.getType() + " " + paramNfo.getName());
            paramsHelp.push(
                "    " + paramNfo.toString().replace("\n", "\n    ")
            );
        }
        return [
            "NAME\n",
            "    ", this.getName(), "\n\n",
            "SYNOPSIS\n",
            "    ", this.getSummary().replace("\n", "\n    "), "\n\n",
            "SYNTAX\n",
            "    ", returnSyntax, this.getName(), 
                "(", params.join(", "), ")\n\n",
            "PARAMETERS\n",
            paramsHelp.join("\n\n"), "\n\n",
            "OUTPUTS\n",
            "    ", returnSyntax.replace(trimPattern, ""), "\n",
            "        ", (this.getReturnDesc() || "").replace("\n", "\n        ")
        ].join("");
    }

    FuncInfo.prototype = {

        toString: toString

    };


    // ------------------------------------------------------------------------
    // ParamInfo object

    function ParamInfo (info) {
        /// <summary>
        /// Initalizes a new Param instance
        /// with the specified name.
        /// </summary>
        /// <param name="info" type="Object">
        /// Parameter information.
        /// </param>
        /// <returns type="ParamInfo">
        /// The initialized ParamInfo object.
        /// </returns>
        info = info || {};
        info.name = info.name || "";
        var doc = info.doc = info.doc || {};
        doc.description = doc.description || "";

        function getName () {
            /// <summary>
            /// Get the name of the parameter.
            /// </summary>
            /// <returns type="String">
            /// The name of the parameter.
            /// </returns>
            return info.name;
        }

        function getType () {
            /// <summary>
            /// Get the type of the parameter.
            /// </summary>
            /// <returns type="String">
            /// The type of the parameter.
            /// </returns>
            return doc.type;
        }

        function getDesc () {
            /// <summary>
            /// Get the parameter's description.
            /// </summary>
            /// <returns type="String">
            /// The parameter's description.
            /// </returns>
            return doc.description;
        }

        this.getName = getName;
        this.getType = getType;
        this.getDesc = getDesc;
    }

    (function () {

        function toString () {
            /// <summary>
            /// Presents the ParamInfo in a PowerShell
            /// parameter help kind of way.
            /// </summary>
            /// <returns type="String">
            /// API help for the parameter.
            /// </returns>
            return [
                "-", this.getName(), " <", this.getType(), ">", "\n",
                "    ", this.getDesc()
            ].join("");
        }
    
        ParamInfo.prototype = {

            toString: toString

        };
    
    })();

    // ------------------------------------------------------------------------

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
                params.push(new this.ParamInfo({ 
                    name: param,
                    doc: paramDoc
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

        getDoc: function (funcString) {
            /// <summary>
            /// Get the function API documentation.
            /// </summary>
            /// <param name="funcString" type="String">
            /// The result of a function's toString.
            /// </param>
            /// <returns type="String">
            /// The function API documentation.
            /// </returns>
            var bodyString = this.stripFuncDeclaration(funcString);
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
            return docLines.join("\n");
        },

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
            var doc = this.replaceParam(doc);
            var div = document.createElement("div");
            div.innerHTML = doc;

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
                    description: description
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

    // ------------------------------------------------------------------------

    cbc.parse = {};

    function func (func) {
        /// <summary>
        /// Parses the specified function.
        /// </summary>
        /// <param name="func" type="Function">
        /// The function to parse.
        /// </param>
        /// <returns type="FuncInfo">
        /// A FuncInfo object.
        /// </returns>
        cbc.assert.param("func", func)
            .is.defined().and.notNull().and.func();

        return new p.FuncInfo(func);
    }

    cbc.parse.func = func;

})(cbc.priv || {});