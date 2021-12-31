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
Object.defineProperty(exports, "__esModule", { value: true });
const https = __importStar(require("https"));
function query(obj) {
    return Object.entries(obj).map(([key, value]) => `${key}=${value}`).join('&');
}
async function request(options) {
    const { method = 'GET', url, data, params, ...others } = options;
    if (url.includes('?'))
        throw Error('url can not has query string, you should use params options');
    return new Promise((resolve, reject) => {
        const { hostname, pathname } = new URL(url);
        const path = `${pathname}?${params ? query(params) : ''}`;
        const options = {
            hostname,
            path,
            method,
            ...others,
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
        // post put 等请求发送数据
        if (data)
            req.write(JSON.stringify(data));
        req.end();
    });
}
exports.default = request;
;
