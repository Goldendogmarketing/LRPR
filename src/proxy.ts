import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Routes that REQUIRE a signed-in user.
 *
 * Note: admin-role enforcement happens inside /admin pages themselves
 * (server-side check against Clerk publicMetadata.role) rather than here,
 * so we don't need a custom JWT template just to gate the admin section.
 * The middleware just guarantees "you are at least signed in."
 */
const isProtectedRoute = createRouteMatcher([
  "/submit-listing",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run middleware for API routes
    "/(api|trpc)(.*)",
  ],
};
