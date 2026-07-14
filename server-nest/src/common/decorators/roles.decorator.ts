import { SetMetadata } from '@nestjs/common';
import type { AuthUser } from './current-user.decorator';

export const ROLES_KEY = 'roles';
export type Role = AuthUser['role'];

/** Restrict a route to one or more roles. Used with RolesGuard. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
