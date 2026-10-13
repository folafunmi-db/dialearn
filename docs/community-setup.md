# Learning community setup

The public anatomy library remains a static, offline-capable Next.js export. The optional `/community/` uses Supabase Auth, Postgres with row-level security, and a private image bucket. Without configuration the page clearly states that sign-in is unavailable; it never simulates an account, subscription, or published lesson.

1. Create or choose a Supabase project. Apply `supabase/migrations/202610130001_community.sql` in the project's SQL editor or migration CLI.
2. Configure the Auth site URL as `https://dialearn-two.vercel.app`. Allow `/community/` on that origin and `http://127.0.0.1:3108/community/` as development redirect URLs. Enable email OTP/magic links, verified email, suitable email rate limits, and production SMTP. The sign-in screen accepts a link or email token.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in local and Vercel build environments. Both are public browser configuration. **Never use a service-role or secret key in either variable.** Rebuild after setting them.
4. Give reviewed educators access through an administrator-controlled SQL command: `update public.profiles set role = 'educator' where id = '<approved-account-uuid>';`. Learners can request access but cannot update their role. Designate a trusted moderator similarly with `role = 'moderator'`.
5. Assign real educators to review pending questions and reports. The learner-facing editor and database both treat discussion submissions as pending. Only the lesson owner or a moderator can approve/hide them.
6. Exercise the real sign-in email, educator draft/publish, learner subscription, automatic notification, schematic upload/download, reflection, moderation and deletion flows with two different test accounts before enabling public enrolment.

## Behaviour

- Educators publish sourced text lessons with a complete text schematic description and optional PNG/JPEG/WebP up to 5 MB. Source URLs must be HTTPS. Active SVG and arbitrary HTML are not accepted. React renders authored prose as text.
- Current subscribers receive a personal in-app notification on first publication. Republishing does not create duplicate notifications. Email delivery of **lesson updates** is not implemented; auth emails are a separate channel.
- Learners can save a lesson, mark it explored, and store a private reflection. There are no public scores, leaderboards, exact-age fields or direct messages.
- Approved discussion posts are shared with authenticated learners. Authors can see their own pending posts; lesson owners/moderators can review them. Posting is limited to one entry per 30 seconds at the database layer.
- Images load only when requested and use expiring signed links. Community records and signed images are never included in the public offline pack or cached by its service worker.
- Emails remain in Auth and are not published in profiles. Account deletion removes dependent rows; uploads are removed first. This does not erase the separate public-exploration notebook in the browser.

## Verification limits

The migration and browser code can be validated locally without a project. Real email delivery, storage policies in the hosted project, and cross-account end-to-end behaviour require the project's URL, public key and applied migration. Do not describe an unconfigured deployment as accepting accounts.
