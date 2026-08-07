import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { sendError } from '../utils/response';
import { UserRole } from '../interfaces/user.interface';

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param allowedRoles Array of allowed UserRole strings e.g. ['recipient'], ['donor'], ['admin']
 */
export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return sendError(res, 'Authentication required before checking permissions.', 401);
    }

    const userRole = req.user.role;

    // Expand 'recipient' and 'user' aliases so both work seamlessly
    const expandedAllowedRoles: string[] = [...allowedRoles];
    if (allowedRoles.includes('recipient') && !expandedAllowedRoles.includes('user')) {
      expandedAllowedRoles.push('user');
    }
    if (allowedRoles.includes('user') && !expandedAllowedRoles.includes('recipient')) {
      expandedAllowedRoles.push('recipient');
    }

    if (!expandedAllowedRoles.includes(userRole)) {
      return sendError(
        res,
        `Access denied. Role '${userRole}' is not permitted to access this resource. Allowed roles: ${allowedRoles.join(', ')}`,
        403
      );
    }

    return next();
  };
};
