import axios from 'axios';
import { showAlert } from './alerts';

const forgotPasswordForm = document.querySelector('.form--forgot-password');

if (forgotPasswordForm)
  forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // ⛔ Stop default form redirect

    const email = document.getElementById('email').value;

    try {
      const res = await axios({
        method: 'POST',
        url: '/api/v1/users/forgotPassword',
        data: { email },
      });

      if (res.data.status === 'success') {
        showAlert('success', 'Reset link sent to your email!');
        window.setTimeout(() => {
          location.assign('/'); // or '/overview'
        }, 1500);
      }
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  });
