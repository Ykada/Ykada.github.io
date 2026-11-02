# ykad_x website

The repository root is the public personal homepage. The portfolio is at /portfolio/, with no links from the homepage and a noindex rule for search engines. The unused work page is not published. The portfolio is publicly accessible by URL; noindex is not access protection.

## Edit the page

- Change public bio, facts, interests, links, Roblox username, and integration URLs in `SITE_CONFIG` at the top of `main.js`.
- Add updates in `DEVLOG.md` in the project root. Copy one entry, including its `<!-- POST -->` marker and metadata, then replace the title, date, tags, summary, and Markdown body. Newest dates appear first automatically. The older `posts/` files are retained as a fallback when `DEVLOG.md` is missing.
- Serve locally with a static server, for example `python -m http.server 8000`, then visit `http://localhost:8000`. Opening the HTML file directly will not load posts.

## Live services

The static homepage has no private credentials. `api/worker.js` is an optional Cloudflare Worker. Deploy it separately, set `SITE_CONFIG.apiBaseUrl` to the Worker HTTPS URL, and allow that Worker URL to serve the `/api/*` routes. The Worker permits requests from `ykada.com`, `www.ykada.com`, and local development origins. If the API is unavailable, the homepage stays usable with offline messages and a 2D avatar fallback.

For Spotify, create an app through Spotify for Developers and complete the authorization code flow **privately** with `user-read-currently-playing` and `user-top-read`. Store `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_REFRESH_TOKEN` as Worker secrets. Never commit them or put them in browser JavaScript. The activity card shows a currently playing track, otherwise the top track for the short-term range. Spotify rankings are not play counts.

For Discord, join the [Lanyard service](https://github.com/Phineas/lanyard), enable activity sharing, and set `DISCORD_USER_ID` as a Worker environment variable. Alternatively set the public `discordUserId` in `SITE_CONFIG` to use Lanyard directly. Only a detected game is called “playing now”; absent activity is shown as offline.

Roblox identity and 2D thumbnails use public endpoints. The known user ID is included in `SITE_CONFIG` so the profile link remains correct if lookup fails. A saved avatar image in `assets/ykad_x-avatar.png` is visible immediately, including when the page is opened directly from disk. The Worker refreshes it from Roblox when connected. The Three.js viewer tries Roblox’s 3D thumbnail manifest and loads OBJ, MTL, and texture assets through the Worker. Roblox currently documents the `avatar-3d` endpoint as requiring API key, OAuth, or cookie authorization. This setup does not request or store Roblox credentials, so Roblox may reject the 3D request. If Roblox provides a permitted public 3D access method later, the viewer is ready for it.

## Publish

Commit and push the changed static files to the GitHub Pages branch used by this repository. Keep the existing `CNAME` containing `ykada.com`. Deploy the optional Worker separately and configure its URL in `SITE_CONFIG`. Confirm DNS and GitHub Pages settings before changing the live domain.
