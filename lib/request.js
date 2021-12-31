const https = require('https');

function query(obj) {
    return Object.entries(obj).map(([key, value]) => `${key}=${value}`).join('&');
}

module.exports = async function request(options) {
    const { method = 'GET', url, data, params, ...others } = options;

    if (url.includes('?')) throw Error('url can not has query string, you should use params options');

    return new Promise((resolve, reject) => {
        const { hostname, pathname } = new URL(url);
        const path = `${pathname}?${params ? query(params) : ''}`;

        const options = {
            hostname,
            path,
            method,
            ...others,
        };
        const req = https.request(options, res => {
            let data = '';
            res.on('data', chunk => (data += chunk));
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);

        // post put 等请求发送数据
        if (data) req.write(JSON.stringify(data));

        req.end();
    });
};
