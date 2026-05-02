import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
const middleware = createMiddleware(routing);
export const proxy = middleware;
export default middleware;
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|fr)/:path*']
};
