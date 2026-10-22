# Pairing code — "Continue on iPad" without email (plan, not built)

**Status:** proposal for Madhurima's call. Nothing in this plan is built. No DECISIONS.md entry covers device pairing yet.

## 1. Goal
A parent who set GMB up on a phone can hand a child an iPad with no email and no long link: the iPad shows a short code, the parent types it on the phone, the iPad continues straight to "Who will join your adventure?".

Today's route (kept as fallback): `DeviceChoiceModal` → Netlify function `send-continuation` → Resend email with `<site>/?start=parent-gate`.

## 2. What the child sees / what the parent does
1. **iPad:** open `<site>/go` (short, easy to type, or via the home-screen app). Screen shows a 6-character code, e.g. `K7M4QX`, plus "Ask a grown-up to enter this code on their phone."
2. **Phone (already set up):** in the parent area tap "Connect a device", type `K7M4QX`, confirm.
3. **iPad:** within about 3 seconds it moves to "pick your friend" with the child's name and age already filled. The existing `handoff` view and `gmb_onboarding_name` / `gmb_onboarding_age` keys are reused; no new child-facing screens.

If the phone never ran setup (parent started on the iPad), the normal parent flow runs. Pairing is a shortcut, not a requirement.

## 3. What is stored (kept minimal on purpose)
One Supabase table `device_pairs`, written only by Netlify functions with the service key (never from the browser):

| Column | Purpose |
|---|---|
| `code` (6 chars, no 0/O/1/I) | what the parent types; unique while active |
| `created_at`, `expires_at` | 10-minute life |
| `child_name`, `child_age` | filled by the phone; nothing else about the child |
| `claimed_at` | set when the iPad picks it up; row deleted right after |
| `failed_tries` | counts wrong claims against this code |

No email, no profile id, no progress. A scheduled function (same pattern as `send-feedback-emails`) deletes expired rows.

## 4. Three small Netlify functions
- `pair-create` (iPad): makes a code, returns it.
- `pair-submit` (phone): `{code, childName, childAge}`; fails if the code is unknown, expired or already used.
- `pair-poll` (iPad, every ~2 s for up to 10 min): returns the name/age once submitted, then deletes the row.

## 5. Safety and privacy
- Code space: 6 characters from a 32-letter alphabet (about a billion combinations); expires after 10 minutes; single use.
- Rate limit: 5 wrong attempts per phone per 10 minutes, and a code locks after 5 failed tries.
- Only a first name (max 20 characters) and an age (3-14) pass through the server, held for minutes, then deleted. Parent consent wording to be added on the "Connect a device" screen and in `PrivacyPolicy.jsx` (needs Madhurima's sign-off for the NRI-parent lens).
- The phone must already have a profile; the iPad never receives anything it didn't ask for with a live code.

## 6. Code changes (all additive)
- New: three functions in `netlify/functions/`, SQL file in `netlify/functions/_sql/`, `PairingScreen` (iPad) and "Connect a device" row in the parent area.
- `App.jsx`: one new view `pair` and a `/go` route; hand off to the existing `handoff` view.
- `DeviceChoiceModal`: add "Show me a code" next to email. Email stays.
- No scene files, no shared voice/timer code.

## 7. Open decisions (need Madhurima)
1. OK to hold a child's first name and age on a server for up to 10 minutes? (Alternative: send only the age and let the child type the name on the iPad.)
2. Short address: `/go`, or a separate short domain?
3. Show the code on the iPad (proposed) or on the phone? iPad-shows is easier for parents; phone-shows works when the iPad has the keyboard handy.
4. Is Supabase (service key) already set in Netlify for production, or only for the beta signups?

## 8. Test plan
- Happy path phone→iPad on real devices (Pixel/iPhone → iPad Safari, and installed PWA).
- Expired code, reused code, wrong code x5 (lockout), two iPads at once, phone offline, iPad closed mid-wait.
- Row cleanup: no `device_pairs` rows older than 10 minutes after a day of testing.
- Kid-test flag (`?kidtest=1`) still works and is unaffected.

## 9. Effort and order
About 1.5 to 2 days: functions + table (0.5), iPad and phone screens (0.5), rate limit + cleanup (0.25), real-device tests (0.5). Do after the preview pass. The Share button + QR code (no server, about half a day) can ship first as the stopgap.
