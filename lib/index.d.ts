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
    requestWithAccessToken(options: any, reTry?: boolean): Promise<any>;
    /**
     * 获取accessToken
     * @return Promise<string>
     */
    getAccessToken(): Promise<string>;
    /**
     * 获取当前应用下所有用户详细信息
     * @return {Promise<*[]>}
     */
    getUsers(): Promise<any>;
    /**
     * 获取用户详细信息
     * @param {string} userId 企业微信中的用户id
     */
    getUser(userId: string): Promise<any>;
    /**
     * 获取本部门成员信息
     * @param {number} id 部门id
     * @param {boolean} [fetchChild=false] 是否递归获取子部门
     * @param {boolean} [detailed=false] 是否是完整信息
     * @return {Promise<*[{}]>}
     */
    getDepartmentUsers(id: number, fetchChild?: boolean, detailed?: boolean): Promise<any>;
    /**
     * 获取所有的部门
     * @return {Promise<*[]>}
     */
    getDepartments(): Promise<any>;
    /**
     * 获取部门及其下的子部门
     * @param {number} id 部门id
     * @return {Promise<unknown>}
     */
    getDepartment(id: number): Promise<any>;
}
