import { Router } from 'express';
import { UserRecord } from '../records/user.record';
import { ValidationError } from '../utils/handleErrors';
import { LoginRecord } from '../records/login.record';
import { isPasswordCorrect } from '../utils/bcrypt-functions';
// import { Status } from '../types';

export const loginRouter = Router()
    .post('/', async (req, res) => {
        const { email, password } = req.body;
        const user = await UserRecord.getOneByEmail(email);
        if (user === null) {
            throw new ValidationError('Niepoprawne dane logowania!');
        }
        // if (user.registerToken !== null) {
        //     throw new ValidationError('Użytkownik znajduje w bazie danych, ale nie dokończył etapu rejestracji!');
        // }
        if (req.cookies.refreshToken !== undefined && (await LoginRecord.getOneByToken(req.cookies.refreshToken))) {
            throw new ValidationError('Użytkownik jest już zalogowany!');
        }
        if (user.role === 'student') {
            const student = await UserRecord.getOneById(user.id);
            if (student === null) {
                throw new ValidationError('Brak danych o kursancie.');
            }
            // if (student.status === Status.Hired) {
            //     throw new ValidationError('Brak dostępu do aplikacji. Skontaktuj się z administracją.');
            // }
        }

        const isCorrect = isPasswordCorrect(password, user.password);
        if (!isCorrect) {
            throw new ValidationError('Niepoprawne dane logowania!');
        }

        try {
            const response = await LoginRecord.createTokens(user.id);
            const loginRecord = new LoginRecord({
                user_id: user.id,
                refreshToken: response.refreshToken,
            });
            await loginRecord.insert();
            res
                .cookie('refreshToken', response.refreshToken, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000,
                })
                .json({
                    id: user.id,
                    accessToken: response.token,
                    role: user.role,
                });
        } catch (err) {
            throw new ValidationError('Wystąpił błąd podczas logowania użytkownika! Spróbuj ponownie pózniej.');
        }
    })

    .delete('/', async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            throw new ValidationError('Użytkownik nie może być wylogowany!');
        }
        try {
            await LoginRecord.getOneByToken(refreshToken);
            await LoginRecord.deleteOneByToken(refreshToken);
            res.clearCookie('refreshToken').json('Użytkownik został pomyślnie wylogowany!');
        } catch (err) {
            throw new ValidationError('Wystąpił błąd podczas wylogowania z aplikacji!');
        }
    });
