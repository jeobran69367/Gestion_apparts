import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Mapping of URLs to menu identifiers
const URL_TO_MENU_MAP: Record<string, string> = {
  '/': 'accueil',
  '/properties': 'properties',
  '/studios': 'studios',
  '/studios/my-studios': 'studios',
  '/studios/create': 'studios',
};

// Public routes that don't require authentication or menu checking
const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/blocked'];

// API routes that should be ignored by this middleware
const API_ROUTES = ['/api'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and public routes
  if (API_ROUTES.some(route => pathname.startsWith(route)) || 
      PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Get the token from cookies or Authorization header
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    // If no token and trying to access protected route, redirect to login
    if (pathname !== '/auth/login') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    // Verify and decode the JWT token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback_secret_for_dev'
    );
    
    const { payload } = await jwtVerify(token, secret);
    const { companyId, blockedMenus } = payload as any;

    // Check if the current path corresponds to a blocked menu
    const menuForPath = getMenuForPath(pathname);
    
    if (menuForPath && companyId && blockedMenus && Array.isArray(blockedMenus)) {
      if (blockedMenus.includes(menuForPath)) {
        // Menu is blocked, redirect to blocked page
        return NextResponse.redirect(new URL('/blocked', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login
    console.error('JWT verification error:', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

function getMenuForPath(pathname: string): string | null {
  // Check exact matches first
  if (URL_TO_MENU_MAP[pathname]) {
    return URL_TO_MENU_MAP[pathname];
  }

  // Check for partial matches (for dynamic routes)
  for (const [urlPattern, menuId] of Object.entries(URL_TO_MENU_MAP)) {
    if (pathname.startsWith(urlPattern + '/') || pathname === urlPattern) {
      return menuId;
    }
  }

  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};