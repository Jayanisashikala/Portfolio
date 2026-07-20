# Jayani Sashikala — Portfolio

A single-file, responsive portfolio site (dark theme, sky-blue accent) built
from Jayani's actual CV — real projects, education, certificates, and
volunteering, with the profile photo and CV pulled straight from the uploaded
document.

```
portfolio/
├── index.html                       ← the entire site (HTML + CSS + JS, one file)
├── assets/
│   ├── profile.jpg                  ← photo, extracted from the CV
│   └── Jayani_Sashikala_CV.pdf      ← downloadable CV (linked from the hero button)
├── backend/                         ← optional API, deployed separately
│   ├── server.js
│   ├── routes/contact.js            ← POST /api/contact
│   ├── data/messages.json           ← contact form submissions land here
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

## How the contact form works

The form in `index.html` works with **zero backend**: submitting it opens the
visitor's email app with a prefilled message. If you deploy `backend/` and
paste its URL into the `API_BASE_URL` constant near the bottom of
`index.html`'s `<script>` tag, the form switches to calling the live API
instead — and still falls back to mailto if the API is unreachable.

## Run it locally

No build step for the site — just open `index.html` in a browser, or serve it:

```bash
cd portfolio
python3 -m http.server 5500
# visit http://localhost:5500
```

To run the backend locally too:

```bash
cd backend
cp .env.example .env      # fill in SMTP values if you want real email delivery
npm install
npm start                 # http://localhost:4000
```

Then in `index.html`, set:
```js
const API_BASE_URL = "http://localhost:4000";
```

## Publish the frontend on GitHub Pages

1. Create a new repository and push this whole folder:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**,
   choose branch `main` and folder `/ (root)`, then **Save**.
4. Your site goes live at `https://<your-username>.github.io/<your-repo>/`
   within a minute or two.

GitHub Pages only serves static files, so `backend/` isn't deployed there —
it needs its own host if you want the contact form to send real emails
instead of opening the visitor's mail app.

## Deploy the backend (optional)

Any Node host works — e.g. [Render](https://render.com), [Railway](https://railway.app),
or [Fly.io](https://fly.io). General steps:

1. Push this same repo (or just `backend/`) to the host.
2. Set the root directory to `backend`, build command `npm install`, start command `npm start`.
3. Add environment variables from `backend/.env.example`:
   - `CORS_ORIGIN` → your GitHub Pages URL, e.g. `https://<your-username>.github.io`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO` → only needed
     if you want form submissions emailed to you. If left blank, submissions are
     still saved to `backend/data/messages.json` on the server.
4. Once deployed, copy the live URL into the `API_BASE_URL` constant in `index.html`.
5. Commit and push — GitHub Pages will redeploy with the backend now connected.

## What's real vs. estimated

Everything in Projects, Education, Certificates, Volunteering, and Contact is
taken directly from your CV. Two things are labeled as estimates, in keeping
with this template's own convention:

- **Skill bar percentages** — your CV doesn't list numeric skill levels, so
  these are reasonable self-rated estimates based on your coursework and
  project mix. Feel free to nudge them up or down in `index.html` (search for
  `class="bar-fill"`).
- **Expected graduation (2027)** — inferred from your 2023 start date on a
  typical 4-year Hons degree; adjust in the About section if different.

Two projects (SignFy, WiSec) and the SLTC Final Year Project (Liyaa) don't
have public repo links in your CV, so their cards say so instead of linking
to a placeholder `#`.

## Customizing

- **Photo**: replace `assets/profile.jpg` with a new image (same filename) —
  no code changes needed.
- **Colors**: all defined as CSS variables at the top of `index.html`
  (`--bg`, `--blue`, etc.) — change once, applies everywhere.
- **Content**: everything is plain HTML in one file — search for the section
  heading (e.g. `id="projects"`) to find and edit it directly.
- **3D background**: a cinematic Three.js scene (drifting glow particles +
  a rotating wireframe polyhedron core) renders behind everything, loaded
  from a CDN (`unpkg.com`) — so an internet connection is needed to see it;
  the rest of the site works fully offline. It respects
  `prefers-reduced-motion` and scales down particle count on mobile. Look
  for the `<!-- Cinematic 3D background -->` script block near the bottom
  of `index.html` to tweak particle count, colors, or rotation speed.
