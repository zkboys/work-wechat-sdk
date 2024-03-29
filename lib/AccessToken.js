"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AccessToken {
    constructor(token, expiresIn) {
        if (!token || !expiresIn) {
            throw new Error('AccessToken \'token\',  \'expiresIn\'  properties are required.');
        }
        this.token = token;
        this.expiresIn = expiresIn;
        this.createdAt = Date.now();
    }
    isExpired() {
        return (this.createdAt + this.expiresIn * 1000) < Date.now();
    }
}
exports.default = AccessToken;
;
