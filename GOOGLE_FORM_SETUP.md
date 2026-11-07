# Custom form connection (not yet activated)

The custom contact form is visually complete but **not connected** to Google Forms. Do not publish it as a working form until you connect and test it.

Recommended stable solution: Google Apps Script Web App -> linked Google Sheet (Google Forms response destination or separate sheet). Google Forms does not provide an official public submission API. An Apps Script web app can append responses to a Sheet, but this does not automatically create entries in the Google Form responses tab.

Deploy an Apps Script web app with permission appropriate for public visitors, then add the following BEFORE `contact-bridge.js` in `contact/index.html`:

`<script>window.RAYMOND_FORM_ENDPOINT='https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';</script>`

Test a real submission in the destination sheet. Because `no-cors` does not expose confirmation, the browser cannot verify that Google saved the entry. For a verified success message, use a proper CORS-capable backend/proxy.

Original form remains available as a fallback link.
