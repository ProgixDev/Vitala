import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';
import { SupabaseService } from '../../supabase/supabase.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AuthUser } from '../decorators/current-user.decorator';
import type { Role } from '../decorators/roles.decorator';
import type { Env } from '../../config/env';

/**
 * Validates the Supabase-issued bearer token on every request and attaches the
 * principal (id, email, role) to `req.user`. Role is read from the JWT's
 * app_metadata / user_metadata (set at signup / by admin), falling back to
 * 'patient'. Routes marked @Public() skip this.
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    const token = this.extractToken(req);
    if (!token) throw new UnauthorizedException('Missing bearer token');

    // Ask Supabase to validate + decode the token (also catches revocation).
    const { data, error } = await this.supabase.admin().auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = data.user;
    const role =
      (user.app_metadata?.role as Role | undefined) ??
      (user.user_metadata?.role as Role | undefined) ??
      'patient';

    const principal: AuthUser = {
      id: user.id,
      email: user.email ?? '',
      role,
      token,
    };
    (req as FastifyRequest & { user: AuthUser }).user = principal;
    return true;
  }

  private extractToken(req: FastifyRequest): string | null {
    const header = req.headers['authorization'];
    if (!header) return null;
    const [scheme, value] = header.split(' ');
    return scheme?.toLowerCase() === 'bearer' && value ? value : null;
  }
}
