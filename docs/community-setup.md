# Project updates and educator proposals

The `/community/` page no longer signs learners or educators in. It contains an email subscription form and a separate educator proposal form. Neither flow loads Supabase Auth or creates an account. Existing account data and the legacy migration have not been deleted.

## Connect delivery

Configure these public HTTPS endpoint URLs in the local and Vercel build environments, then rebuild:

- `NEXT_PUBLIC_PROJECT_SUBSCRIPTION_ENDPOINT`
- `NEXT_PUBLIC_PROJECT_PROPOSAL_ENDPOINT`

These must be dedicated server endpoints, not email-service API URLs requiring a private key. Keep provider credentials server-side. No delivery service or receiving endpoint is currently configured by this change.

The subscription endpoint accepts JSON `{email, consent: true, locale, website: ""}`. Validate email and affirmative consent on the server, rate-limit requests, and send a confirmation email. Return HTTP 200/202 and `{ "status": "confirmation_sent" }` only once that email has been accepted for delivery. Confirm ownership before activating the subscriber. Responses should not reveal whether an address is already subscribed. New-project campaigns must target confirmed subscribers and include a working unsubscribe link.

The proposal endpoint accepts JSON `{name,email,title,idea,stage,language,sources,consent: true,locale,website: ""}`. Validate field lengths and types server-side, reject spam, rate-limit, and store submissions in a private review queue. Return HTTP 200/201/202 and `{ "status": "received" }` only after durable storage. Treat source URLs as text; do not fetch arbitrary submitted URLs. Do not publish proposals or enroll proposal authors in project updates automatically.

Allow CORS only from the deployed site and explicit development origins. Never make subscriber lists or private proposals publicly readable. Endpoints should return a non-2xx error on failure. The client times out after 15 seconds, retains entered values after failure, and displays success only for the expected server status.

Without an endpoint, subscriptions show an unavailable notice and a disabled submit button. Educators can prepare and download a proposal locally; it is explicitly not submitted. This fallback never claims that an email or proposal was received.

## Activation checks

Verify confirmation email, confirmation link, new-project delivery, unsubscribe, duplicate submissions, rate limits, rejected requests, and private proposal receipt against the chosen production service before opening subscriptions. Browser UI and TypeScript checks do not establish delivery.
