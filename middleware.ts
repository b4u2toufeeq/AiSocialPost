import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protect dashboard pages and APIs
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/compose(.*)",
  "/calendar(.*)",
  "/media(.*)",
  "/accounts(.*)",
  "/auto-reply(.*)",
  "/analytics(.*)",
  "/billing(.*)",
  "/settings(.*)",
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Exclude public Clerk webhooks (simple prefix check; avoids unsupported regex lookaheads)
  if (req.nextUrl.pathname.startsWith("/api/webhooks/clerk")) return;

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});


export const config = {
  matcher: [
    // Run middleware for app routes, but skip Next internals and common static assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|js|map|ico|woff2?|ttf|eot)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
