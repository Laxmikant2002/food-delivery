import { Request } from 'express';

export interface DeliveryAgentPayload {
  id: string;
  email: string;
  name: string;
  isOnline: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: DeliveryAgentPayload;
}
