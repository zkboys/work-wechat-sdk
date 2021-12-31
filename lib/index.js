"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AccessToken_1 = __importDefault(require("./AccessToken"));
const request_1 = __importDefault(require("./request"));
/**
 * 企业微信sdk
 */
class WorkWechat {
    /**
     *
     * @param {string} corpId 企业微信id
     * @param {number} agentId 应用id
     * @param {string} corpSecret 应用秘钥
     */
    constructor(corpId, agentId, corpSecret) {
        if (!corpId || !corpSecret || !agentId) {
            throw new Error('WorkWechat  requires \'corpId\', \'corpSecret\' and  \'agentId\'');
        }
        // 单利模式
        const key = `${corpId}&&${agentId}&&${corpSecret}`;
        // @ts-ignore
        if (WorkWechat[key])
            return WorkWechat[key];
        // @ts-ignore
        WorkWechat[key] = this;
        this.corpId = corpId;
        this.agentId = agentId;
        this.corpSecret = corpSecret;
    }
    /**
     * 携带access_token参数的请求
     * @param {{url, params, data}} options 请求参数
     * @param {boolean} [reTry] 重试
     */
    requestWithAccessToken(options, reTry) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params = {} } = options;
            params.access_token = yield this.getAccessToken();
            let res = yield (0, request_1.default)(Object.assign(Object.assign({}, options), { params }));
            // 已经是重试了，直接返回结果
            if (reTry)
                return res;
            // access_token有问题，重新发起一次请求
            if ([
                40014,
                41001,
                42001, // access_token已过期
            ].includes(res.errorcode)) {
                this.accessToken = null;
                res = this.requestWithAccessToken(Object.assign(Object.assign({}, options), { params }), true);
            }
            if (res.errcode !== 0)
                throw Error(`${res.errcode} ${res.errmsg}`);
            return res;
        });
    }
    /**
     * 获取accessToken
     * @return Promise<string>
     */
    getAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const { corpId, corpSecret, accessToken } = this;
            // 没过期，直接使用
            if (accessToken && !accessToken.isExpired())
                return accessToken.token;
            // 过期了，重新获取
            const url = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken';
            const params = { corpid: corpId, corpsecret: corpSecret };
            const result = yield (0, request_1.default)({ url, params });
            this.accessToken = new AccessToken_1.default(result.access_token, result.expires_in);
            return this.accessToken.token;
        });
    }
    /**
     * 获取当前应用下所有用户详细信息
     * @return {Promise<*[]>}
     */
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const departments = yield this.getDepartments();
            const topDepartments = departments.filter((item) => !departments.some((it) => it.id === item.parentid));
            const promises = topDepartments.map((dept) => {
                const { id } = dept;
                return this.getDepartmentUsers(id, true, true);
            });
            const res = yield Promise.all(promises);
            // 去重
            return res.flat().reduce((prev, user) => {
                if (!prev.some((item) => item.userid === user.userid))
                    prev.push(user);
                return prev;
            }, []);
        });
    }
    /**
     * 获取用户详细信息
     * @param {string} userId 企业微信中的用户id
     */
    getUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'https://qyapi.weixin.qq.com/cgi-bin/user/get';
            const params = { userid: userId };
            return yield this.requestWithAccessToken({ url, params });
        });
    }
    /**
     * 获取本部门成员信息
     * @param {number} id 部门id
     * @param {boolean} [fetchChild=false] 是否递归获取子部门
     * @param {boolean} [detailed=false] 是否是完整信息
     * @return {Promise<*[{}]>}
     */
    getDepartmentUsers(id, fetchChild = false, detailed = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `https://qyapi.weixin.qq.com/cgi-bin/user/${detailed ? '' : 'simple'}list`;
            const params = {
                department_id: id,
                fetch_child: fetchChild ? 1 : 0,
            };
            const res = yield this.requestWithAccessToken({ url, params });
            return res.userlist;
        });
    }
    /**
     * 获取所有的部门
     * @return {Promise<*[]>}
     */
    getDepartments() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'https://qyapi.weixin.qq.com/cgi-bin/department/list';
            const res = yield this.requestWithAccessToken({ url });
            return res.department;
        });
    }
    /**
     * 获取部门及其下的子部门
     * @param {number} id 部门id
     * @return {Promise<unknown>}
     */
    getDepartment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'https://qyapi.weixin.qq.com/cgi-bin/department/list';
            const params = { id };
            const res = yield this.requestWithAccessToken({ url, params });
            return res.department[0];
        });
    }
}
exports.default = WorkWechat;
;
