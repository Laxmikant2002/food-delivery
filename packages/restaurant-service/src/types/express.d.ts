import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        restaurant_id: string;
    };
}
