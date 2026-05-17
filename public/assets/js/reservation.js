'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const reservationForm = document.getElementById('reservation-form');
  const dateInput = reservationForm.querySelector('input[name="date"]');
  const submitBtn = reservationForm.querySelector('button[type="submit"]');
  
  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  if (dateInput) {
    dateInput.min = today;
  }

  if (reservationForm) {
    reservationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Clear previous error messages if any
      const existingError = reservationForm.querySelector('.reservation-error');
      if (existingError) {
        existingError.remove();
      }

      // Disable button
      submitBtn.disabled = true;
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="text text-1">Booking...</span><span class="text text-2" aria-hidden="true">Booking...</span>';

      const formData = new FormData(reservationForm);
      
      const payload = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        people: parseInt(formData.get('people')),
        date: formData.get('date'),
        time: formData.get('time'),
        message: formData.get('message') || ''
      };

      try {
        const response = await fetch('/api/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          // Success State
          reservationForm.innerHTML = `
            <div class="reservation-success" role="status">
              <h2 class="headline-1 text-center" style="margin-bottom: 20px;">Table Booked!</h2>
              <p class="body-1 text-center">Thank you, ${payload.name}. Your reservation for ${payload.people} people on ${payload.date} at ${payload.time} is confirmed.</p>
              <p class="body-1 text-center" style="margin-top: 10px;">We look forward to hosting you soon.</p>
            </div>
          `;
        } else {
          // Validation / Server Error
          showError(data.message || 'Validation failed. Please check your inputs and try again.');
          resetButton();
        }
      } catch (error) {
        // Network Error
        showError('A network error occurred. Please check your connection or contact us directly by phone.');
        resetButton();
      }

      function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'reservation-error';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.textContent = message;
        // Insert at the top of the form
        reservationForm.insertBefore(errorDiv, reservationForm.firstChild);
      }

      function resetButton() {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }
});