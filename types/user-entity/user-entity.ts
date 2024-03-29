export interface UserInterface {
    username: string;
    isAdmin: boolean;
    id: string
}

export interface DatabaseUserInterface {
    username: string;
    password: string;
    isAdmin: boolean;
    _id: string;
}

export interface RegUserEntity {
    id?: string;
    name: string;
    email: string;
    hashedPassword: string;
}
