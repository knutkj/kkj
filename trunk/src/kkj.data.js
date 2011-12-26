/// <reference path="kkj.evt.js" />

var kkj = kkj || {};

kkj.data = kkj.data || {};

kkj.data._YqlMerge = function (window) {
    this.window = window;
};

kkj.data._YqlMerge.prototype = {
    
    _serviceUrl: [
        "http://query.yahooapis.com/v1/public/yql",
        "q={query}&format=json&callback={callback}"
    ].join("?"),

    url: function (query, callback) {
        return this._serviceUrl
            .replace("{query}", encodeURIComponent(query))
            .replace("{callback}", callback);
    },

    _callbackName: function (source) {
        return "{0}Callback".replace("{0}", source);
    },

    merge: function (queries) {
        /// <summary>
        /// Merges the result of the specified queries.
        /// </summary>
        var deferred = new kkj.evt.Deferred();
        var numQueries = queries.length;
        var session = {
            _data: [],
            _numFetched: 0,
            done: function (data) {
                this._data = this._data.concat(data);
                if (++this._numFetched === numQueries) {
                    deferred.resolve(this._data);
                }
            } 
        };
        var _fetch = this._fetch;
        var numberOfQueries = queries.length;
        for (var i = 0; i < numberOfQueries; i++) {
            var query = queries[i];
            this._fetch(query, session);
        }
        return deferred;
    },

    _fetch: function (params, session) {
        var callbackName = this._callbackName(params.source);
        var url = this.url(params.query, callbackName);
        var win = this.window;
        this.window[callbackName] = function (data) {
            session.done(params.data(data));
            delete win[callbackName];
        };
        var script = this.window.document.createElement("script");
        script.src = url;
        this.window.document.body.appendChild(script);
        return this.window[callbackName];
    }

};

kkj.data.YqlMerge = new kkj.data._YqlMerge(window);