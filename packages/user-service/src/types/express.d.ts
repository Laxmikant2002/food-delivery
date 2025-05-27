import { UserType } from './context';

declare global {
    namespace Express {
        interface Request {
            user?: UserType;
        }
    }
}

export { };
