# External Share (Exshare) — User Manual

## Overview

External Share ("Exshare") lets you send a document to any email address without creating an account. Recipients get a time-limited link and must verify with a one-time passcode (OTP) before viewing the document.

- Default link validity: 7 days (set by your admin)
- OTP validity: 10 minutes; max 3 attempts before needing a new code
- Permissions: View-only or Edit (if granted by the owner/admin)

## Prerequisites

- You must be the document owner or an admin to send exshares.
- The recipient must access the unique link sent to their email and complete OTP verification.

## Sending an Exshare (from Documents)

1. Open the Documents grid or document drawer.
2. Click "Share via Email (Exshare)" and enter one or more recipient emails.
3. Choose permission (View or Edit), then send. Recipients receive an email with their unique link.

## Recipient Flow (email + OTP)

1. Click the link in the email (goes to `/exshare/<token>`).
2. Click "Send OTP" to email a 6-digit code to the same address.
3. Enter the OTP within 10 minutes; on success, the document preview loads.
4. If preview fails to load, retry later or ask the sender to regenerate a link.

## Expired Link? Request a Refresh

If the link shows as expired:

1. On the expired page, click "Request Link Refresh".
2. (Optional) Add a short note explaining why you need access.
3. Submit; the admin/owner will extend or re-issue the link. You’ll get a new email when it’s updated.

## Admin Dashboard (manage all exshares)

Location: `/dashboard/external-shares` (admins only)

- View all exshares with filters: All, Refresh Requests, Expired.
- See key fields: document, recipient email, permission, status, expiry, refresh note.
- Extend expiry: choose days (1–365). A new invite email is sent with updated expiry.
- Delete share: removes access and link.
- Stats: totals for active, expired, and pending refresh requests.

## Best Practices

- Use View permission unless the recipient must edit.
- Keep links short-lived; extend only as needed.
- Remind recipients to check spam if OTP emails don’t arrive.
- For sensitive files, re-issue a fresh link instead of extending old ones.

## Troubleshooting

- **OTP not arriving:** Check spam; request OTP again after 1 minute; ensure the same email used in the invite.
- **Link expired:** Submit a refresh request from the expired page; wait for admin to extend.
- **Too many OTP attempts:** Ask the sender/admin to re-issue the share.
- **Preview not loading:** Verify network and try again; if still failing, ask the sender to provide a new link.
