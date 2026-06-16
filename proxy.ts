import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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
]);

const isApiRoute = createRouteMatcher(["/api/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname.startsWith("/api/webhooks/clerk")) return;
  if (req.nextUrl.pathname.startsWith("/api/inngest")) return;

  if (isProtectedRoute(req) || isApiRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|js|map|ico|woff2?|ttf|eot)).*)",
    "/(api|trpc)(.*)",
  ],
};
