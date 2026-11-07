/* V11: repair silent submit; cross-origin Google Forms cannot be receipt-verified. */
(function () {
  'use strict';
  const form = document.getElementById('raymond-native-form');
  const frame = document.getElementById('raymond-google-response');
  const status = document.getElementById('native-form-status');
  if (!form || !frame || !status) return;
  const button = form.querySelector('button[type="submit"]');
  const fallback = 'https://docs.google.com/forms/d/e/1FAIpQLSc91kvVM2Lx69vHJf2Uokxqjj31DHA-I17QwApOw-2e5Y8bfA/viewform';
  let pending = false, timer = null, startedAt = 0;
  function show(message, kind) {
    status.textContent = message;
    status.dataset.state = kind || 'info';
  }
  function finish(message, kind) {
    clearTimeout(timer); pending = false; button.disabled = false;
    button.textContent = 'Send inquiry ↗'; show(message, kind);
  }
  form.addEventListener('invalid', function(e) {
    show('Please complete the required fields and check the contact consent box.', 'error');
  }, true);
  form.addEventListener('submit', function (event) {
    if (!form.checkValidity()) {
      event.preventDefault(); form.reportValidity();
      show('Please complete the required fields and check the contact consent box.', 'error');
      return;
    }
    if (pending) { event.preventDefault(); return; }
    pending = true; startedAt = Date.now();
    button.disabled = true; button.textContent = 'Submitting…';
    show('Sending your inquiry. Please wait…', 'info');
    timer = setTimeout(function () {
      if (!pending) return;
      finish('We could not verify receipt. Please check with Raymond or use the original Google Form link below. Do not assume your inquiry was received.', 'error');
    }, 12000);
    // The browser submits this HTML form to the named, offscreen iframe.
    // Do not preventDefault() here; no fetch/CORS request is involved.
  });
  frame.addEventListener('load', function () {
    if (!pending || Date.now() - startedAt < 150) return;
    finish('The submission request completed, but Google Forms does not let this website verify that it was saved. Please confirm the test entry in Google Forms → Responses.', 'warning');
  });
})();
