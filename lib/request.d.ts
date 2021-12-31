/// <reference types="node" />
import { RequestOptions } from 'https';
export interface Options extends RequestOptions {
    url: string;
    data?: any;
    params?: any;
}
export default function request(options: Options): Promise<unknown>;
