// Host-aware redirect helper.
//
// `NextResponse.redirect(new URL(path, request.url))` builds an absolute URL
// from whatever host Next.js sees on the incoming request, which can be
// `0.0.0.0:3000` when the dev server binds to all interfaces. That broken
// host then leaks into the browser.
//
// Per RFC 7231 §7.1.2, a relative Location header is valid and the browser
// resolves it against the current document/request origin. Using a plain
// Response with a relative Location keeps the redirect on whatever host the
// user actually used (localhost, LAN IP, tunnel, anything).
export function redirectTo(path: string, status: 302 | 307 = 307): Response {
  return new Response(null, {
    status,
    headers: { Location: path },
  });
}
