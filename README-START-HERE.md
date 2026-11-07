# Raymond Chen website — review build

This is a complete static site, with CSS, JavaScript, fonts and image assets. Do not extract individual HTML files without the accompanying folders.

## Preview locally
From the extracted folder run `python -m http.server 8000`, then visit `http://localhost:8000/`. Do not rely on opening an individual HTML file from a ZIP preview.

## Deploy to GitHub Pages
Upload the CONTENTS of this folder to the root of the GitHub repository. In Settings > Pages choose Deploy from branch, main, /(root). If the repository is not mapped to a custom domain, root-relative URLs should be tested before going live.

## GoDaddy domain
The assumed canonical domain is `raymondchen.ca`; confirm domain ownership and current DNS before changes. GitHub Pages apex A records: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153. `www` CNAME points to YOUR-GITHUB-USERNAME.github.io (replace placeholder). Set the domain in GitHub Pages and enable HTTPS after DNS propagation. Do not remove mail-related DNS records.

## Contact form status — important
The pre-existing custom contact form is retained. Its Google Forms connection was NOT activated or tested; Google Forms does not offer an official public submission API. The existing fallback Google Form link can be used while a supported endpoint is configured. Do not advertise the custom form as successfully saving responses until a real end-to-end submission has been verified. See GOOGLE_FORM_SETUP.md.

## Calculators and legal resources
The mortgage estimator is illustrative and excludes default insurance. LTT is a planning estimate; verify Toronto tax brackets and special cases with an Ontario real estate lawyer before publishing. LTB forms link to the official forms directory so current versions can be downloaded. Commercial leasing is excluded from LTB residential forms.

## Review checklist
Confirm brokerage, awards, personal metrics, real estate photos and contact details. AI-generated architecture imagery is illustrative only, not an actual Raymond listing or project.
