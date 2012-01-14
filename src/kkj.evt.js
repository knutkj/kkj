
var kkj = kkj || {};

kkj.evt = {

    Deferred: window.jQuery && window.jQuery.Deferred || function () {
        /// <summary>
        /// Creates a new object with the same
        /// interface as the jQuery.Deferred object.
        /// Note that this is a simplified implementation
        /// with lots of limitations. Functions are documented
        /// with the limitations.
        /// </summary>

        var _doneCallbacks = [];
        var _resolved = false;
        var _resolvedArgs;

        this.always = this.done = this.fail = this.isRejected = 
            this.isResolved = this.notify = this.notifyWith = 
            this.pipe = this.progress = this.reject = this.rejectWith = 
            function () {
            /// <summary>Not implemented.</summary>
            throw new Error("Not implemented.");
        };

        this.state = function () {
            /// <summary>
            /// Determine the current state of a Deferred object.
            /// </summary>
            return _resolved ? "resolved" : "pending";
        };

        this.then = function (doneCallback) {
            /// <summary>
            /// Add a handler to be called when the Deferred 
            /// object is resolved or rejected.
            /// </summary>
            /// <param name="doneCallback" type="Function">
            /// A function called when the Deferred is resolved.
            /// </param>
            if (typeof doneCallback === "undefined") {
                throw new Error("doneCallback needs to be specified.");
            }
            if (typeof doneCallback !== "function") {
                throw new Error("doneCallback needs to of type function.");
            }
            if (arguments.length > 1) {
                throw new Error("You may only specify the doneCallback.");
            }
            if (_resolved) {
                doneCallback.apply(this, _resolvedArgs);
                return;
            }
            _doneCallbacks.push(doneCallback);
            return this;
        };

        this.resolve = function (args) {
            /// <summary>
            /// Resolve a Deferred object and call any doneCallbacks
            /// with the given args.
            /// </summary>
            /// <param name="args" parameterArray="true" type="Object">
            /// Optional arguments that are passed to the doneCallbacks.
            /// </param>
            if (_resolved) {
                return;
            }
            _resolvedArgs = arguments;
            _resolved = true;
            var numberOfCallbacks = _doneCallbacks.length;
            for (var i = 0; i < numberOfCallbacks; i++) {
                _doneCallbacks[i].apply(this, arguments);
            }
            return this;
        };

        this.promise = function () {
            /// <summary>
            /// Return a Deferred's Promise object.
            /// </summary>
            if (arguments.length !== 0) {
                throw new Error("You may not specify arguments.");
            }
            return { 
                then: this.then, 
                state: this.state,
                always: this.always,
                done: this.done,
                fail: this.fail,
                isRejected: this.isRejected,
                isResolved: this.isResolved,
                pipe: this.pipe,
                progress: this.progress
            };
        };
    }
};