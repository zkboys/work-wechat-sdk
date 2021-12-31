const assert = require('assert');
const WorkWechat = require('../lib/index.js');

const corpId = 'wx8918a4299cc1b440';
const agentId = 1000029;
const corpSecret = 'wUQcs3PlyiurqT7nKXD9mHOgD99JBOfZkB5h2Udqmv8';
const workWechat = new WorkWechat(corpId, agentId, corpSecret);
const workWechat2 = new WorkWechat(corpId, agentId, corpSecret);

describe('work wechat', function() {
    it('should be singleton', async () => {
        const accessToken = await workWechat.getAccessToken();
        const accessToken2 = await workWechat2.getAccessToken();
        assert(accessToken);
        assert(accessToken === accessToken2);
    });
    it('user should OK', async () => {
        const res = await workWechat.getUser('sxf4657');
        assert(res.name === '王淑彬');
    });
    it('all users should OK', async () => {
        const res = await workWechat.getUsers();
        console.log(res);
        assert(Array.isArray(res));
    });
    it('department users should OK', async () => {
        const res = await workWechat.getDepartmentUsers(60);
        assert(Array.isArray(res));
    });
    it('deep departments users should OK', async () => {
        const res = await workWechat.getDepartmentUsers(60, true, true);
        assert(Array.isArray(res));
    });

    it('departments should OK', async () => {
        const res = await workWechat.getDepartments();
        assert(Array.isArray(res));
    });
    it('department should OK', async () => {
        const res = await workWechat.getDepartment(1213);
        assert(res);
    });
});
