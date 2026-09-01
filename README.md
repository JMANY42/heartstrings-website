# HEARTSTRINGS WEBSITE

This is the website for heartstrings at UTD. 

## Microsoft Graph email setup

The backend now sends email through delegated Microsoft Graph access so it can use the consumer account `heartstringsofficial@outlook.com`.

1. In Entra ID, register the app for `Accounts in any organizational directory and personal Microsoft accounts`.
2. Add delegated permissions for `Mail.Send`, `offline_access`, `openid`, `profile`, and `email`.
3. Set the redirect URI to `http://localhost:3001/api/auth/microsoft/callback`.
4. Put the app's client ID, client secret, tenant/common authority, and redirect URI into `backend/.env`.
5. Start the backend, then visit `http://localhost:3001/api/auth/microsoft/start` once to connect the Outlook account.
6. Set `GRAPH_CONTACT_RECIPIENT` to the inbox that should receive collaboration form emails.
7. After auth succeeds, the backend stores refresh tokens under `backend/data/graph-tokens.json`.
8. Optionally set `PUBLIC_SITE_URL` to the public site address. It is shown in the footer of the join email so recipients can see where their address was entered, which helps Outlook treat the message as legitimate transactional mail.

## Saved form submissions

Every submission that passes validation is appended to a JSON file, so nothing is lost if the mailbox is unauthorized or Graph is down:

- `backend/data/join.json` — membership form submissions (`name`, `email`, `instrument`, `experienceLevel`)
- `backend/data/collaborate.json` — collaboration form submissions (`name`, `email`, `organization`, `message`)

Each entry also carries an `id`, an ISO `submittedAt` timestamp, and `emailStatus` (`sent`, `failed`, `not_configured`, or `authorization_required`) so you can tell which submitters never received or generated an email. Submissions missing a required field are rejected and not stored, and a failed write is logged rather than failing the form.

The files live in `backend/data/`, which is git-ignored. The directory is resolved from the process working directory, so in production (pm2 runs the server from `backend/dist`) set `SUBMISSION_STORE_DIR` in `backend/.env` to an absolute path such as `/var/www/heartstrings-website/backend/data` to keep the records outside the build output.