"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const https = __importStar(require("https"));
function query(obj) {
    return Object.entries(obj).map(([key, value]) => `${key}=${value}`).join('&');
}
function request(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { method = 'GET', url, data, params } = options, others = __rest(options, ["method", "url", "data", "params"]);
        if (url.includes('?'))
            throw Error('url can not has query string, you should use params options');
        return new Promise((resolve, reject) => {
            const { hostname, pathname } = new URL(url);
            const path = `${pathname}?${params ? query(params) : ''}`;
            const options = Object.assign({ hostname,
                path,
                method }, others);
            const req = https.request(options, (res) => {
                let data = '';
                console.log(res);
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
            // post put 等请求发送数据
            if (data)
                req.write(JSON.stringify(data));
            req.end();
        });
    });
}
exports.default = request;
;
