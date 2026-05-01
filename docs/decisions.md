# Architecture Decisions

---

## Error handling pattern: discriminated union return

**Decision:** All auth API functions return `{ data, error: null } | { data: null, error }` — matching the Supabase JS client's own return shape.

**Why:** Callers can handle errors inline without try/catch noise. Consistent with the SDK the app already imports. Throwing would require wrapping every call site in try/catch and loses the error type.

---

## Auth token storage: SecureStore adapter (not AsyncStorage)

**Decision:** The Supabase client uses `expo-secure-store` as its storage backend.

**Why:** AsyncStorage is unencrypted on iOS. Tokens are credentials and must be stored in the encrypted keychain. SecureStore maps to iOS Keychain and Android Keystore. The performance cost (async reads on cold start) is acceptable.

---

## `detectSessionInUrl: false` in Supabase client

**Decision:** Always `false` in the mobile client.

**Why:** Setting this to `true` causes Supabase to try to read `window.location` — which crashes React Native. The web default is `true`, so this is a hard requirement for mobile. Deep-link handling is done manually via `expo-linking` and `exchangeCodeForSession`.

---

## App directory at root (`app/`) not `src/app/`

**Decision:** Routes live in `app/` at the repo root; non-route source lives in `src/`.

**Why:** Expo Router v6 defaults to `app/` at root. Using `src/app/` requires configuring the `root` option in `app.json`'s expo-router plugin, which adds complexity and has been unreliable across SDK versions. The canonical Expo layout was used instead. This is noted as a deviation from the original spec.

---

## Google OAuth: fresh implementation (not ported from web)

**Decision:** `oauth-google.ts` is written from scratch for React Native using `expo-auth-session` + `expo-web-browser`.

**Why:** The web app has **no Google OAuth implementation** — only stub references. The mobile implementation uses PKCE via `signInWithOAuth` with `skipBrowserRedirect: true`, opens a `WebBrowser.openAuthSessionAsync` session, and exchanges the code via `exchangeCodeForSession`. This is the recommended approach for Expo + Supabase.

---

## Dev vs. standalone OAuth redirect

**Decision:** In `__DEV__` mode, `makeRedirectUri` uses the Expo proxy scheme. In production builds, the app's custom scheme `coolify-ai://` is used.

**Why:** Expo Go does not support arbitrary custom schemes. The Expo auth session proxy handles redirects during development. This requires the proxy URL to be added to Supabase's allowed redirect URLs as well — documented in README.

---

## Password reset: PKCE code exchange (not hash fragment tokens)

**Decision:** `reset-password.tsx` calls `supabase.auth.exchangeCodeForSession(url)` on the full deep-link URL.

**Why:** Supabase now defaults to PKCE flow for new projects, returning a `code` parameter rather than access/refresh tokens in the URL fragment. `exchangeCodeForSession` handles both formats correctly.

---

## Sign-up: single `fullName` field (not firstName + lastName)

**Decision:** Mobile sign-up collects one `fullName` field, stored in `profiles.full_name` via trigger metadata.

**Why:** The web app splits into firstName + lastName but the database stores `full_name` as a single column. Using one field is simpler for mobile and matches the database schema directly.

---

## `ensure_user_dashboard_setup` RPC: not called automatically

**Decision:** The RPC is defined in the migration and documented, but NOT called automatically after sign-in in the mobile app.

**Why:** The trigger on `auth.users` INSERT creates the profile + role atomically. The RPC is a repair function for edge cases (e.g., trigger failure, manual user creation). Calling it on every sign-in adds latency. Add an explicit call if you observe missing profiles in production.

---

## Sentry: installed, not initialized

**Decision:** `@sentry/react-native` is in `package.json` but init code is not present.

**Why:** Initialization requires a DSN, which the owner doesn't have yet. The `// TODO(sentry)` comment in `app/_layout.tsx` marks where to add `Sentry.init({ dsn })` once available. The Sentry plugin is intentionally NOT added to `app.json` plugins (doing so would break the build without native setup steps).
