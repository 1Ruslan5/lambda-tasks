interface User{
    user_id: string,
    email: string,
    password: string,
    lastAttempts: number[],
    valid: boolean,
    refresh_token?: string,
    expression_time?: string
}
export default User;