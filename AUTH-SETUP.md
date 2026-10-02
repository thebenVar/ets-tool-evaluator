# Password-protecting the site

The whole site (landing page and the form) sits behind one shared password,
checked by `middleware.js` before Vercel serves anything. This runs
server-side on Vercel's edge, so — unlike a password check written in the
page's own JavaScript — it can't be bypassed by viewing page source, since
the page itself is never sent until the password checks out.

The password itself is never stored or committed anywhere. Only a salted
SHA-256 hash of it lives in Vercel's environment variables.

## 1. Generate the hash

Pick the password you'll share with participants, then run, from this
project's folder:

```bash
node scripts/hash-password.mjs "the password you want to share"
```

This prints two values, e.g.:

```
AUTH_SALT=3f1c9a8e2b7d4f10...
AUTH_PASSWORD_HASH=9c2a1e7b...
```

Don't commit these, don't paste the plaintext password anywhere — just copy
the two lines it prints.

## 2. Set them in Vercel

1. Vercel dashboard → this project → **Settings → Environment Variables**.
2. Add `AUTH_SALT` and `AUTH_PASSWORD_HASH` with the values from step 1.
3. Apply them to **Production** (and **Preview**, if you want preview
   deployments gated too).
4. Redeploy (or just push a commit — the env vars take effect on the next
   deployment).

## 3. What participants see

A browser's native username/password prompt (HTTP Basic Auth) — they can
leave the username blank or type anything, only the password is checked.
Most browsers remember it for the rest of that browser session, so they
shouldn't be asked again while the event is running.

## Changing or removing the password later

- **Change it**: re-run step 1 with the new password, update both env vars,
  redeploy.
- **Remove the gate entirely**: delete the `AUTH_PASSWORD_HASH` env var (or
  set it empty). `middleware.js` fails open — with no hash configured, it
  lets every request through rather than locking everyone out.

## What this does and doesn't protect against

- It stops casual access and search-engine indexing of a site you haven't
  announced yet — good enough for keeping a workshop tool scoped to the room
  it's meant for.
- Basic Auth sends the password with every request, protected only by HTTPS
  in transit (which Vercel provides by default) — fine here, but this is a
  shared-password gate for a known audience, not a substitute for per-user
  accounts or protecting genuinely sensitive data.
