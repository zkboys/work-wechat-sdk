import AccessToken from './AccessToken';
import request from './request';

/**
 * 企业微信sdk
 */
export default class WorkWechat {
    private readonly corpId: string | undefined;
    private readonly agentId: number | undefined;
    private readonly corpSecret: string | undefined;
    private accessToken: AccessToken | null | undefined;

    /**
     *
     * @param {string} corpId 企业微信id
     * @param {number} agentId 应用id
     * @param {string} corpSecret 应用秘钥
     */
    constructor(corpId: string, agentId: number, corpSecret: string) {
        if (!corpId || !corpSecret || !agentId) {
            throw new Error('WorkWechat  requires \'corpId\', \'corpSecret\' and  \'agentId\'');
        }

        // 单利模式
        const key = `${corpId}&&${agentId}&&${corpSecret}`;
        // @ts-ignore
        if (WorkWechat[key]) return WorkWechat[key];
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
    async requestWithAccessToken(options: any, reTry?: boolean) {
        const { params = {} } = options;
        params.access_token = await this.getAccessToken();

        let res: any = await request({ ...options, params });

        // 已经是重试了，直接返回结果
        if (reTry) return res;

        // access_token有问题，重新发起一次请求
        if ([
            40014, // 不合法的access_token
            41001, // 缺少access_token参数
            42001, // access_token已过期
        ].includes(res.errorcode)) {
            this.accessToken = null;
            res = this.requestWithAccessToken({ ...options, params }, true);
        }

        if (res.errcode !== 0) throw Error(`${res.errcode} ${res.errmsg}`);

        return res;
    }

    /**
     * 获取accessToken
     * @return Promise<string>
     */
    async getAccessToken() {
        const { corpId, corpSecret, accessToken } = this;

        // 没过期，直接使用
        if (accessToken && !accessToken.isExpired()) return accessToken.token;

        // 过期了，重新获取
        const url = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken';
        const params = { corpid: corpId, corpsecret: corpSecret };
        const result: any = await request({ url, params });

        this.accessToken = new AccessToken(result.access_token, result.expires_in);

        return this.accessToken.token;
    }

    /**
     * 获取当前应用下所有用户详细信息
     * @return {Promise<*[]>}
     */
    async getUsers() {
        const departments = await this.getDepartments();
        const topDepartments = departments.filter((item: any) => !departments.some((it: any) => it.id === item.parentid));
        const promises = topDepartments.map((dept: any) => {
            const { id } = dept;
            return this.getDepartmentUsers(id, true, true);
        });

        const res = await Promise.all(promises);
        // 去重
        return res.flat().reduce((prev, user) => {
            if (!prev.some((item: any) => item.userid === user.userid)) prev.push(user);

            return prev;
        }, []);
    }

    /**
     * 获取用户详细信息
     * @param {string} userId 企业微信中的用户id
     */
    async getUser(userId: string) {
        const url = 'https://qyapi.weixin.qq.com/cgi-bin/user/get';
        const params = { userid: userId };

        return await this.requestWithAccessToken({ url, params });
    }

    /**
     * 获取本部门成员信息
     * @param {number} id 部门id
     * @param {boolean} [fetchChild=false] 是否递归获取子部门
     * @param {boolean} [detailed=false] 是否是完整信息
     * @return {Promise<*[{}]>}
     */
    async getDepartmentUsers(id: number, fetchChild = false, detailed = false) {
        const url = `https://qyapi.weixin.qq.com/cgi-bin/user/${detailed ? '' : 'simple'}list`;
        const params = {
            department_id: id,
            fetch_child: fetchChild ? 1 : 0,
        };
        const res = await this.requestWithAccessToken({ url, params });

        return res.userlist;
    }

    /**
     * 获取所有的部门
     * @return {Promise<*[]>}
     */
    async getDepartments() {
        const url = 'https://qyapi.weixin.qq.com/cgi-bin/department/list';
        const res = await this.requestWithAccessToken({ url });
        return res.department;
    }

    /**
     * 获取部门及其下的子部门
     * @param {number} id 部门id
     * @return {Promise<unknown>}
     */
    async getDepartment(id: number) {
        const url = 'https://qyapi.weixin.qq.com/cgi-bin/department/list';
        const params = { id };
        const res = await this.requestWithAccessToken({ url, params });
        return res.department[0];
    }
};