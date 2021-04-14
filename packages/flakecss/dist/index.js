var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
function isBrowser() {
    return typeof window !== 'undefined';
}
var counter = 0;
var globalStyle = '';
var DETERMINISTIC_CLASSNAMES = false;
export function css(styleObject) {
    var parsed = compileCss(styleObject);
    if (!isBrowser()) {
        globalStyle += parsed.styleHtml;
    }
    else {
        getStyleEl().innerHTML += parsed.styleHtml;
    }
    return parsed.classes;
}
export function extractCss() {
    return globalStyle;
}
export function compileCss(styleObj) {
    var classes = {};
    var styleHtml = '';
    Object.entries(styleObj).forEach(function (_a) {
        var _b = __read(_a, 2), selector = _b[0], styles = _b[1];
        var suffix = DETERMINISTIC_CLASSNAMES ? getDeterministicClassnameSuffix(styles) : counter++;
        var className = selector + "-" + suffix;
        counter++;
        classes[selector] = className;
        styleHtml += getNestedSelectors(styles, className);
        var directRules = rules(getDirectProperties(styles));
        if (directRules) {
            styleHtml += "." + className + "{" + directRules + "}";
        }
    });
    if (process.env.NODE_ENV === 'development') {
        styleHtml =
            '\n' +
                styleHtml
                    .replace(/(\{)/g, ' $&\n')
                    .replace(/(\})/g, '$&\n')
                    .replace(/([^;]*;)/g, '$&\n');
    }
    return { classes: classes, styleHtml: styleHtml };
}
function getDeterministicClassnameSuffix(obj) {
    return hash(JSON.stringify(obj));
}
function getDirectProperties(styleObject) {
    var e_1, _a;
    var extractedProps = {};
    try {
        for (var _b = __values(Object.entries(styleObject)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), propKey = _d[0], propVal = _d[1];
            if (typeof propVal === 'object') {
                continue;
            }
            extractedProps[propKey] = propVal;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return extractedProps;
}
function getNestedSelectors(styleObject, className) {
    return Object.entries(styleObject).reduce(function (acc, _a) {
        var _b = __read(_a, 2), key = _b[0], styles = _b[1];
        if (isNestedSelector(key)) {
            acc += "." + className + key.slice(1) + "{" + rules(styles) + "}";
        }
        else if (isMediaQuery(key)) {
            acc += key + "{." + className + " {" + rules(styles) + "}}";
        }
        return acc;
    }, '');
}
function rules(rules) {
    return Object.entries(rules)
        .map(function (_a) {
        var _b = __read(_a, 2), prop = _b[0], val = _b[1];
        val = maybeAddPx(prop, val);
        return dashCase(prop) + ':' + val + ';';
    })
        .join('');
}
function isNestedSelector(key) {
    return key.startsWith('&');
}
function isMediaQuery(key) {
    return key.startsWith('@media');
}
var unitlessProperties = new Set(['opacity', 'zIndex', 'fontWeight']);
function maybeAddPx(attr, val) {
    if (typeof val === 'string' || unitlessProperties.has(attr)) {
        return val;
    }
    return val + "px";
}
function dashCase(str) {
    return str.replace(/([a-z])([A-Z])/g, function (s) { return s[0] + '-' + s[1].toLowerCase(); });
}
export var FLAKE_STYLE_ID = 'FLAKE_CSS';
var styleEl = (isBrowser() && document.getElementById(FLAKE_STYLE_ID)) || null;
function getStyleEl() {
    if (styleEl) {
        return styleEl;
    }
    styleEl = document.createElement('style');
    styleEl.id = FLAKE_STYLE_ID;
    document.head.appendChild(styleEl);
    return styleEl;
}
function hash(str) {
    if (str.length == 0) {
        return 0;
    }
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return hash;
}
export var mediaQuery = {
    up: function (bp) { return "@media only screen and (min-width: " + bp + "px)"; },
    down: function (bp) { return "@media only screen and (max-width: " + bp + "px)"; },
    between: function (min, max) {
        return "@media only screen and (min-width: " + min + "px) and (max-width: " + max + "px)";
    },
};
//# sourceMappingURL=index.js.map