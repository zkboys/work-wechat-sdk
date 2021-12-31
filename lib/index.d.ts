import { Options as RequestOptions } from './request';
export interface User {
    userid: string;
    name: string;
    department: number[];
    order: number[];
    position: string;
    mobile: string;
    gender: ['1', '2'];
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
    private readonly corpId;
    private readonly agentId;
    private readonly corpSecret;
    private accessToken;
    /**
     *
     * @param {string} corpId 企业微信id
     * @param {number} agentId 应用id
     * @param {string} corpSecret 应用秘钥
     */
    constructor(corpId: string, agentId: number, corpSecret: string);
    /**
     * 携带access_token参数的请求
     * @param {{url, params, data}} options 请求参数
     * @param {boolean} [reTry] 重试
     */
    requestWithAccessToken(options: RequestOptions, reTry?: boolean): Promise<any>;
    /**
     * 获取accessToken
     */
    getAccessToken(): Promise<string>;
    /**
     * 获取当前应用下所有用户详细信息
     */
    getUsers(): Promise<User[]>;
    /**
     * 获取用户详细信息
     * @param {string} userId 企业微信中的用户id
     */
    getUser(userId: string): Promise<User>;
    /**
     * 获取本部门成员信息
     * @param {number} id 部门id
     * @param {boolean} [fetchChild=false] 是否递归获取子部门
     * @param {boolean} [detailed=false] 是否是完整信息
     */
    getDepartmentUsers(id: number, fetchChild?: boolean, detailed?: boolean): Promise<User[]>;
    /**
     * 获取所有的部门
     */
    getDepartments(): Promise<Department[]>;
    /**
     * 获取部门及其下的子部门
     * @param {number} id 部门id
     */
    getDepartment(id: number): Promise<Department>;
}
