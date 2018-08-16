(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.router = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    exports.default = routes => {
        beforeEach(() => {
            cy.server();

            // disable all xhrs
            cy.route('**', {});

            // implement our fixtures
            Object.entries(routes).forEach(([path, endpoint]) => {
                cy.route(path, `fixture:${endpoint}.json`).as(endpoint);
            });
        });
    };
});
//# sourceMappingURL=router.js.map