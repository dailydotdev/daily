# Fix: "Please complete the security check" Error on Registration

## Problem Description
When completing registration on daily.dev:
1. User fills out the onboarding sign-up form completely (including Turnstile captcha) with a username that is already taken (e.g., `example`).
2. Server/validation responds with an error: username is taken.
3. User edits the username to something unique (e.g., `example2957202`).
4. Upon resubmitting, the site gets stuck throwing:
   > **"Please complete the security check."**
   even though Turnstile is valid / completed. The user is trapped and forced to reload the page to start over.

## Root Cause Analysis
1. **Turnstile Infinite Reset Loop on Keystrokes (`Object.keys(hints).length`)**:
   - In `RegistrationForm.tsx`, when an input's value changes to fix an error, it calls `onUpdateHints({ ...hints, [field]: '' })`.
   - The key is still present in `hints` with an empty string value `''`.
   - The effect `useEffect([hints])` checked `if (Object.keys(hints).length)`, which evaluated to `true` (length is 1).
   - This caused `turnstileRef.current.reset()` to fire repeatedly on every single character typed, constantly wiping the token.
2. **Race Condition in `appearance: 'interaction-only'` Mode**:
   - Turnstile executes silently in the background. Because it was constantly resetting while typing, when the user hit submit, `turnstileRef.current.getResponse()` was `undefined`, triggering `setTurnstileError(true)`.
3. **Missing `onSuccess` Callback on `<Turnstile>`**:
   - There was no callback to set `turnstileError(false)` once Turnstile verified. The error alert remained pinned to the DOM even if Turnstile succeeded.

## Solution
1. **Check for Active Errors:**
   Only reset Turnstile when `Object.values(hints).some((val) => Boolean(val?.length))` has new non-empty errors, preventing resets during typing/clearing.
2. **Track Token in State:**
   Added `turnstileToken` state.
3. **Add Lifecycle Callbacks to `<Turnstile>`:**
   - `onSuccess`: Stores `turnstileToken` and clears `turnstileError`.
   - `onExpire`: Clears token and resets the widget.
   - `onError`: Clears token and marks error.
4. **Use Validated Token in Form Submission:**
   Checks `turnstileToken || turnstileRef.current?.getResponse()`.

## Files Modified
- `packages/shared/src/components/auth/RegistrationForm.tsx`
- `patches/fix-registration-turnstile.patch` (Apply directly to `dailydotdev/apps` using `git apply`)
