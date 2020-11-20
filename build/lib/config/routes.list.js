"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getRoutesOfLayer(path, layer) {
    if (layer.method) {
        return [layer.method.toUpperCase() + ' ' + path];
    }
    else if (layer.route) {
        return getRoutesOfLayer(path + split(layer.route.path), layer.route.stack[0]);
    }
    else if (layer.name === 'router' && layer.handle.stack) {
        let routes = [];
        layer.handle.stack.forEach(function (stackItem) {
            routes = routes.concat(getRoutesOfLayer(path + split(layer.regexp), stackItem));
        });
        return routes;
    }
    return [];
}
function split(thing) {
    if (typeof thing === 'string') {
        return thing;
    }
    else if (thing.fast_slash) {
        return '';
    }
    else {
        var match = thing.toString()
            .replace('\\/?', '')
            .replace('(?=\\/|$)', '$')
            .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//);
        return match
            ? match[1].replace(/\\(.)/g, '$1')
            : '<complex:' + thing.toString() + '>';
    }
}
const routesList = (app) => {
    app._router.stack.forEach(function (layer) {
        const temp = getRoutesOfLayer('', layer);
        for (const t of temp)
            console.log(t);
    });
};
exports.default = routesList;
