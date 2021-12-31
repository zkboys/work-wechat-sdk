import AccessToken from './AccessToken';
import axios, { AxiosRequestConfig } from 'axios';

export interface User {
    userid: string;
    name: string;
    department: number[];
    order: number[];
    position: string;
    mobile: string;

    gender: [ '1', '2' ],
    email: string;
    is_leader_in_dept: number[];
    direct_leader: string[];
    avatar: string;
    thumb_avatar: string;
    telephone: string;
    alias: string;
    status: number;
    address: string;
    hide_mobile: number;
    english_name: string;
    open_userid: string;
    main_department: number;
    qr_code: string;
    external_position: string;
}

export interface Department {
    id: number;
    name: string;
    name_en: string;
    department_leader: string[];
    parentid: number;
    order: number;
}

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
    async requestWithAccessToken(options: AxiosRequestConfig, reTry?: boolean) {
        const { params = {} } = options;
        params.access_token = await this.getAccessToken();

        let { data } = await axios({ ...options, params });

        // 已经是重试了，直接返回结果
        if (reTry) return data;

        // access_token有问题，重新发起一次请求
        if ([
            40014, // 不合法的access_token
            41001, // 缺少access_token参数
            42001, // access_token已过期
        ].includes(data.errorcode)) {
            this.accessToken = null;
            data = this.requestWithAccessToken({ ...options, params }, true);
        }

        if (data.errcode !== 0) throw Error(`${data.errcode} ${data.errmsg}`);

        return data;
    }

    /**
     * 获取accessToken
     */
    async getAccessToken(): Promise<string> {
        const { corpId, corpSecret, accessToken } = this;

        // 没过期，直接使用
        if (accessToken && !accessToken.isExpired()) return accessToken.token;

        // 过期了，重新获取
        const url = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken';
        const params = { corpid: corpId, corpsecret: corpSecret };
        const { data } = await axios({ url, params });

        this.accessToken = new AccessToken(data.access_token, data.expires_in);

        return this.accessToken.token;
    }

    /**
     * 获取当前应用下所有用户详细信息
     */
    async getUsers(): Promise<User[]> {
        const departments = await this.getDepartments();
        const topDepartments = departments.filter((item) => !departments.some((it) => it.id === item.parentid));
        const promises = topDepartments.map((dept: Department) => {
            const { id } = dept;
            return this.getDepartmentUsers(id, true, true);
        });

        const res = await Promise.all(promises);
        // 去重
        return res.flat().reduce((prev: User[], user: User) => {
            if (!prev.some((item: User) => item.userid === user.userid)) prev.push(user);

            return prev;
        }, []);
    }

    /**
     * 获取用户详细信息
     * @param {string} userId 企业微信中的用户id
     */
    async getUser(userId: string): Promise<User> {
        const url = 'https://qyapi.weixin.qq.com/cgi-bin/user/get';
        const params = { userid: userId };

        return await this.requestWithAccessToken({ url, params });
    }

    /**
     * 获取本部门成员信息
     * @param {number} id 部门id
     * @param {boolean} [fetchChild=false] 是否递归获取子部门
     * @param {boolean} [detailed=false] 是否是完整信息
     */
    async getDepartmentUsers(id: number, fetchChild = false, detailed = false): Promise<User[]> {
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
     */
    async getDepartments(): Promise<Department[]> {
        const url = 'https://qyapi.weixin.qq.com/cgi-bin/department/list';
        const res = await this.requestWithAccessToken({ url });
        return res.department;
    }

    /**
     * 获取部门及其下的子部门
     * @param {number} id 部门id
     */
    async getDepartment(id: number): Promise<Department> {
        const url = 'https://qyapi.weixin.qq.com/cgi-bin/department/list';
        const params = { id };
        const res = await this.requestWithAccessToken({ url, params });
        return res.department[0];
    }
};
