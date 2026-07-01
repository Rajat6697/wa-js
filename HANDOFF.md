# Handoff — Eazybe QRP slim WA-JS build + WhatsApp ban investigation

> Status note for continuing this work in a new Claude Code / chat session.
> Written 2026-06-30. This file is safe to delete or gitignore; it is not part of WA-JS.

## Context / goal

Eazybe's Chrome extension (separate repo: `c:\User Files\Github\eazybe-extension-3.0`)
injects WA-JS into WhatsApp Web. Users' WhatsApp accounts are getting banned. We
investigated the cause, then started building a slim + renamed WA-JS bundle.

## Repos (important — easy to mix up)

| Path | What it is |
|------|------------|
| `C:\Users\rajat_rkevzir\Documents\GitHub\wa-js` | **THE FORK** — `origin = github.com/Rajat6697/wa-js`, `upstream = wppconnect-team/wa-js`. Work happens here. Branch: `main-rajat`. |
| `c:\User Files\Github\wa-js` | An upstream clone (`origin = wppconnect-team`). NOT the fork. (Has leftover changes that should be reverted — see Pending.) |
| `c:\User Files\Github\eazybe-extension-3.0` | The extension. The Claude Code session is anchored here, so resume chats from this folder. |

## Why accounts get banned (investigation summary)

Server-observable behavior is what WhatsApp acts on — not the mere presence of WA-JS.

- **Behavioral (affects users who send):**
  - Direct Broadcast — same message to a whole label via `DIRECT`/WA-JS send, fixed 10s cadence → `components/topbar/BroadcastDialog.tsx` (`handleDirectBroadcast`).
  - Scheduler burst — all due messages sent with no delay → `src/features/whatsapp/components/scheduler/SchedulerRuntime.tsx:58`.
  - Bulk number-probing — `contact.queryExists` + `contact.save` on every import / new-number send → `entrypoints/store-bridge/utils.ts:167,210` (batched 5-parallel, no delay, via `createWidsForChatIds`).
  - Bulk `SendSeen` across a label → `entrypoints/store-bridge/handlers.ts:3914`.
  - No rate-limiting, jitter, or daily caps anywhere.
- **Idle / just-installed users get banned too** → points at the WA-JS injection fingerprint itself + the extension **auto-opening WhatsApp Web on install/update/startup** (`entrypoints/background/services/extension-open-lifecycle.ts:498,765`).
- **Not the cause:** WABA broadcast (official API, safe); auto-contact-creation (hits only CRM/Google Sheets, not WhatsApp). WA-JS is current (v4.3.1 = latest), so not an outdated-lib problem.

**Real ban levers (do these, not the slim build):** lazy-inject `wpp.js` (not on idle/fresh installs); stop auto-open-on-install; rate-govern `queryExists`/`SendSeen`/sends; move proactive/bulk messaging to WABA.

## QRP slim build — what's done

On `main-rajat` (= v4.3.1 + 2 `sendRawMessage.ts` lid-fix commits), three **additive** files
(no upstream files modified → clean `upstream` merges):

- `src/index.qrp.ts` — slim entry; exposes only `chat, conn, contact, ev, group, labels, profile, util, whatsapp` (+ loader/config); **drops the `gtag` telemetry import**.
- `webpack.qrp.config.js` — inherits `webpack.config.js`, overrides entry → `src/index.qrp.ts`, output → `dist/qrp-wa.js`, global library name `WPP` → **`QRP`**.
- `package.json` — added script `"build:qrp": "webpack --config webpack.qrp.config.js"`.

Kept: chat, conn, contact, ev, group, labels, profile, util, whatsapp.
Dropped: blocklist, lists, call, cart, catalog, community, newsletter, order, privacy, status, gtag.

### Build
```bash
cd "C:/Users/rajat_rkevzir/Documents/GitHub/wa-js"
npm install          # node_modules not present yet in this clone
npm run build:qrp    # -> dist/qrp-wa.js, exposes window.QRP
```

### Key empirical result (don't skip)
Slim build = **495 KiB** vs full = **490 KiB** (at v4.3.1). **No size win** — actually ~5 KiB
larger. The core (webpack injection + `whatsapp` Store extraction + media deps like
`file-type`/`buffer` used by `sendFileMessage`) is irreducible because the extension uses
chat/contact/group/labels/profile/whatsapp. Real gains are only: gtag/telemetry removal,
the QRP rename, and dropped eager init-hooks of unused modules. **It is NOT a ban fix and
NOT a meaningful slimming.**

## Pending tasks

1. `git commit` the 3 files on `main-rajat` (push is the user's call).
2. Smoke-test: inject `dist/qrp-wa.js` on WhatsApp Web, confirm `window.QRP.loader.onReady(...)` fires and a `window.QRP.chat` / `contact` call works.
3. Revert the upstream clone `c:\User Files\Github\wa-js`: its `main-rajat` was reset v3.23.4→v4.3.1 and the same files were added + `dist` built — restore it (reset `main-rajat` to `fa7cd9f846`, remove added files, switch back to `main`).
4. If proceeding to use QRP in the extension: wire `entrypoints/store-bridge/` — either a one-line alias `window.WPP = window.QRP` after the script loads, or find/replace ~100 `window.WPP` references. (The rename is branding/isolation only — NOT anti-detection.)

## How to continue the chat
The session is anchored to `eazybe-extension-3.0`. Launch Claude Code from there and run
`claude --resume` (or `/resume`) to reopen this conversation; project memory also auto-loads
there. From inside that one session, edit this fork via absolute paths (as was done here).
