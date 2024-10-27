import {Middleware, MiddlewareContext} from '@loopback/rest';
import * as jwt from 'jsonwebtoken';

export const AuthMiddleware: Middleware = async (
  ctx: MiddlewareContext,
  next: Function,
) => {
  const req = ctx.request;
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');
      ctx.bind('currentUser').to(decoded);
    } catch (error) {
      return ctx.response
        .status(401)
        .send({success: false, message: 'Token inválido'});
    }
  }

  return next();
};
