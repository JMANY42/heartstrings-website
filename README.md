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