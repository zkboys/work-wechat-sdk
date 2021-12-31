export default class AccessToken {
    readonly token: string;
    private readonly expiresIn;
    private readonly createdAt;
    constructor(token: string, expiresIn: number);
    isExpired(): boolean;
}
