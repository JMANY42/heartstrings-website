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

## Special event pages

Each special event gets its own page at `/events/<slug>`. Everything a page
shows — the collaborator, the objective, the detail rows, the ticket link, the
guest speakers — comes from one entry in `frontend/src/data/events.ts`; add an
entry there and the page exists, along with its card in the Impact section on
the home page. The `details` list is an ordered set of rows, so an event can
carry whatever fields it actually has rather than a fixed location/date/time.

Photos for a page go in `frontend/src/assets/events/<slug>/`. The file named
`highlight` becomes the wide photo at the top; the rest fill the photo rail.
See the README in that folder.

## The musicians page

`/musicians` is one card per entry in `frontend/src/data/musicians.ts` — photo,
name, an optional officer role under the name, a chip per instrument they play
(`instruments` is a list), their major, when they joined, and a short blurb. Cards render in the order the file lists them, so that file
is the running order. Photos go in `frontend/src/assets/musicians/`, one per
musician named after their `slug`; see the README in that folder. A musician
without a photo gets their initials in a soft circle rather than a gap.

The founders section on the home page links here. Its own copy — the photo of
the co-founders and their mission statement — lives in
`frontend/src/data/founders.ts`.

**Nginx must serve `index.html` for these paths.** The build has no file at
`/events/<slug>` or `/musicians`, so without a fallback a direct visit or a
refresh 404s. The server block needs:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Saved form submissions

Every submission that passes validation is appended to a JSON file, so nothing is lost if the mailbox is unauthorized or Graph is down:

- `backend/data/join.json` — membership form submissions (`name`, `email`, `instrument`, `experienceLevel`)
- `backend/data/collaborate.json` — collaboration form submissions (`name`, `email`, `organization`, `message`)

Each entry also carries an `id`, an ISO `submittedAt` timestamp, and `emailStatus` (`sent`, `failed`, `not_configured`, or `authorization_required`) so you can tell which submitters never received or generated an email. Submissions missing a required field are rejected and not stored, and a failed write is logged rather than failing the form.

The files live in `backend/data/`, which is git-ignored. The directory is resolved from the process working directory, so in production (pm2 runs the server from `backend/dist`) set `SUBMISSION_STORE_DIR` in `backend/.env` to an absolute path such as `/var/www/heartstrings-website/backend/data` to keep the records outside the build output.