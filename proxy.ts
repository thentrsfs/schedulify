import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Definišemo koje su rute javne (dostupne svima)
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/api/webhooks/clerk(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    // Ako ruta nije javna, Clerk će automatski zahtevati autentifikaciju
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