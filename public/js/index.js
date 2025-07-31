/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';
import { signup } from './signup';
import { resetPassword } from './updateSettings';
import './forgotPassword';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const signupForm = document.querySelector('.form--signup');
const resetForm = document.querySelector('.form--reset-password');
const searchBtn = document.getElementById('search-btn');
const starContainer = document.querySelector('.reviews__rating');
const ratingInput = document.getElementById('rating');
const reviewForm = document.querySelector('.form--review');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(document.getElementById('map').dataset.location);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    signup(name, email, password, passwordConfirm);
  });
}

if (resetForm) {
  resetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const token = resetForm.dataset.token;
    resetPassword(token, password, passwordConfirm);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);
if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);

    const photoInput = document.getElementById('photo');
    if (photoInput.files.length > 0) {
      form.append('photo', photoInput.files[0]);
    }

    // Optionally, log all key/value pairs in FormData:
    for (const pair of form.entries()) {
      console.log(pair[0], pair[1]);
    }

    updateSettings(form, 'data');
  });

//   const name = document.getElementById('name').value;
//   const email = document.getElementById('email').value;
//   const photo = document.getElementById('photo').file;
//   updateSettings({ name, email, photo }, 'data');
// });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('search') === 'success') {
    showAlert('success', 'Search successful! Displaying tours near you.');
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const distance = document.getElementById('distance').value;
      const unit = document.getElementById('unit').value;

      if (!distance) return showAlert('error', 'Please provide a distance!');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const targetUrl = `/tours-within/${distance}/center/${latitude},${longitude}/unit/${unit}?search=success`;

          // Redirect to the new URL
          window.location.assign(targetUrl);
        },
        () => {
          showAlert(
            'error',
            'Could not get your position. Please allow location access.',
          );
        },
      );
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // --- STAR RATING INTERACTIVITY ---
  // Use a more specific selector to target the stars inside the form
  const starContainer = document.querySelector(
    '.form--review .reviews__rating',
  );
  const ratingInput = document.getElementById('rating');

  if (starContainer) {
    const stars = Array.from(starContainer.children);

    const handleStarClick = (e) => {
      const star = e.target.closest('.reviews__star--form');
      if (!star) return;

      const rating = star.dataset.rating;
      ratingInput.value = rating; // Set the value of the hidden input

      stars.forEach((s, i) => {
        // The 'reviews__star--active' class should have a fill color in your CSS
        s.classList.toggle('reviews__star--active', i < rating);
        s.classList.toggle('reviews__star--inactive', i >= rating);
      });
    };

    starContainer.addEventListener('click', handleStarClick);
  }
});

if (reviewForm) {
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const tourId = reviewForm.dataset.tourId;
    const review = document.getElementById('review').value;
    const rating = document.getElementById('rating').value;
    if (!rating) {
      return showAlert(
        'error',
        'Please select a star rating before submitting.',
      );
    }

    const submitBtn = reviewForm.querySelector('button');
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
      // Your backend route is POST /api/v1/tours/:tourId/reviews
      const res = await fetch(`/api/v1/tours/${tourId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ review, rating }),
      });

      const data = await res.json();

      if (data.status === 'success') {
        showAlert('success', 'Thank you for your review!');
        // Reload the page to show the new review
        window.setTimeout(() => {
          location.reload();
        }, 1500);
      } else {
        showAlert('error', data.message);
      }
    } catch (err) {
      showAlert('error', 'Something went wrong. Please try again.');
    } finally {
      submitBtn.textContent = 'Submit review';
      submitBtn.disabled = false;
    }
  });
}
