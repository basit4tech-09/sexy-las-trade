/* ==========================================================================
   Contact Form — AJAX submission to FormSubmit
   ========================================================================== */

(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const note = document.getElementById('contact-form-note');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    fetch(form.action, { method: 'POST', body: formData })
      .then(() => {
        form.reset();
        if (note) note.hidden = false;
      })
      .catch((err) => {
        console.warn('Contact form submission failed:', err);
        if (note) {
          note.textContent = "Something went wrong — please message us on WhatsApp instead.";
          note.hidden = false;
        }
      });
  });
})();
