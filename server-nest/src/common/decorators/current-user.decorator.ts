import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** The authenticated principal attached to the request by SupabaseAuthGuard. */
export interface AuthUser {
  id: string; // == auth.users.id == profiles.id
  email: string;
  role: 'patient' | 'nurse' | 'admin';
  /** Raw bearer token, so services can build an RLS-scoped Supabase client. */
  token: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return data ? req.user?.[data] : req.user;
  },
);
