import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Definišemo koje su rute potpuno javne
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/api/webhooks/clerk(.*)',
]);

// Definišemo rute koje služe isključivo za autentifikaciju (gde ulogovan korisnik ne treba da ide)
const isAuthRoute = createRouteMatcher([
  '/login(.*)',
  '/register(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const currentUrl = new URL(request.url);

  // 🚀 Ako je korisnik ulogovan i pokuša da pristupi landing-u ili auth stranicama
  if (userId && (currentUrl.pathname === '/' || isAuthRoute(request))) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Ako ruta nije javna, Clerk zahteva prijavu
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Preskače Next.js internale i statičke fajlove (slike, css, itd.)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Uvek pokreni za API rute
    '/(api|trpc)(.*)',
  ],
};