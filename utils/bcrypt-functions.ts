import * as bcrypt from 'bcrypt';
import { ValidationError } from './handleErrors';

export const hashPassword = (password: string): string => {
    try {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    } catch (error) {
        throw new ValidationError('Problem z hashowaniem hasła.');
    }
};

export const isPasswordCorrect = (passwordEntered: string, hashedPassword: string): boolean => {
    try {
        return bcrypt.compareSync(passwordEntered, hashedPassword);
    } catch (error) {
        throw new ValidationError('Problem z porównywaniem haseł.');
    }
    return false;
};
