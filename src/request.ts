import * as https from 'https';
import { RequestOptions } from 'https';

export interface Options extends RequestOptions {
    url: string;
    data?: any;
    params?: any;
}

function query(obj: any) {
    return Object.entries(obj).map(([ key, value ]) => `${key}=${value}`).join('&');
}

export default async function request(options: Options) {
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
        const req = https.request(options, (res: any) => {
            let data = '';
            res.on('data', (chunk: any) => (data += chunk));
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);

        // post put 等请求发送数据
        if (data) req.write(JSON.stringify(data));

        req.end();
    });
};
