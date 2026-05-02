import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
const middleware = createMiddleware(routing);
export const proxy = middleware;
export default middleware;
 
export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files (_next, images, favicon, etc.)
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
