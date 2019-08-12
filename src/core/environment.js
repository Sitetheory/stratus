System.register(["@stratus/core/conversion", "lodash"], function (exports_1, context_1) {
    "use strict";
    var conversion_1, _, Environment;
    var __moduleName = context_1 && context_1.id;
    function cookie(name, value, expires, path, domain) {
        const request = {
            name,
            value,
            expires,
            path: path || '/',
            domain
        };
        if (name && typeof name === 'object') {
            _.extend(request, name);
        }
        let data;
        if (typeof request.value === 'undefined') {
            const search = new RegExp('(?:^' + request.name + '|;\\s*' + request.name + ')=(.*?)(?:;|$)', 'g');
            data = search.exec(document.cookie);
            return null === data ? null : data[1];
        }
        data = request.name + '=' + escape(request.value) + ';';
        if (request.expires) {
            if (request.expires instanceof Date) {
                if (isNaN(request.expires.getTime())) {
                    request.expires = new Date();
                }
            }
            else {
                request.expires = new Date(new Date().getTime() + conversion_1.seconds(request.expires) * 1000);
            }
            data += 'expires=' + request.expires.toUTCString() + ';';
        }
        if (request.path) {
            data += 'path=' + request.path + ';';
        }
        if (request.domain) {
            data += 'domain=' + request.domain + ';';
        }
        document.cookie = data;
    }
    exports_1("cookie", cookie);
    return {
        setters: [
            function (conversion_1_1) {
                conversion_1 = conversion_1_1;
            },
            function (_1) {
                _ = _1;
            }
        ],
        execute: function () {
            Environment = class Environment {
                constructor() {
                    this.cookie = cookie;
                }
            };
            exports_1("Environment", Environment);
        }
    };
});
