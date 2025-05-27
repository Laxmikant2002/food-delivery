import { Request } from 'express';
import { UserType } from './context';

declare global {
    namespace Express {
        // Extend Request to include our user type
        interface Request {
            user?: UserType;
        }
    }
}

// Type for endpoints that require authentication
export interface AuthenticatedRequest extends Request {
    user: UserType;  // User is required in authenticated requests
}

// Type for endpoints where user is optional but properly typed
export type OptionalAuthRequest = Request;
