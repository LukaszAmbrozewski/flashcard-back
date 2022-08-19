export interface Login {
    id?: string;
    user_id: string;
    refreshToken: string;
}

export interface LoginCreated {
    id: string;
    token: string;
    refreshToken: string;
}
