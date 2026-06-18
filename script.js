/* ================================================
   JourneyHub – script.js
   Handles: navbar scroll, mobile menu, smooth scroll,
            scroll reveal, form submission, back-to-top
   ================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Elements ---------- */
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('nav-links');
  const backToTop  = document.getElementById('back-to-top');
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const allNavLinks = document.querySelectorAll('.nav-link');
  const sections    = document.querySelectorAll('section[id]');


  /* ================================================
     1. NAVBAR — shrink on scroll + active link
     ================================================ */
  function handleNavbar () {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Highlight active nav link based on scroll position
    let current = '';
    sections.forEach(sec => {
      const sectionTop = sec.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = sec.getAttribute('id');
      }
    });

    allNavLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', handleNavbar, { passive: true });
  handleNavbar(); // run once on load


  /* ================================================
     2. MOBILE MENU — hamburger toggle
     ================================================ */
  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  allNavLinks.forEach(link => {
    link.addEventListener('click', function () {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });


  /* ================================================
     3. SMOOTH SCROLLING for all anchor links
     ================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = navbar.offsetHeight;
      const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    });
  });


  /* ================================================
     4. SCROLL REVEAL — fade-in on scroll
     ================================================ */
  // Add reveal class to animated elements
  const revealTargets = [
    '.dest-card',
    '.pkg-card',
    '.testi-card',
    '.feature-item',
    '.section-header',
    '.why-left',
    '.why-right',
    '.contact-left',
    '.contact-right'
  ];

  revealTargets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 0.08) + 's';
    });
  });

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


  /* ================================================
     5. BACK TO TOP button
     ================================================ */
  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }, { passive: true });

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  /* ================================================
     6. CONTACT FORM — validation + success message
     ================================================ */
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    // Basic validation
    if (!name || !email || !message) {
      shakeForm();
      return;
    }
    if (!isValidEmail(email)) {
      document.getElementById('email').style.borderColor = '#ef4444';
      setTimeout(() => {
        document.getElementById('email').style.borderColor = '';
      }, 2000);
      return;
    }

    // Send actual data to the backend API!
    const destination = document.getElementById('destination').value;
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        destination: destination,
        message: message
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to save to database');
      }
      return response.json();
    })
    .then(data => {
      // Hide submit button and show success message
      submitBtn.style.display = 'none';
      formSuccess.classList.add('visible');
      contactForm.reset();
    })
    .catch(error => {
      console.error('Error submitting form:', error);
      alert('Oops! Could not connect to the backend server. Make sure it is running and your database is connected.');
      // Re-enable the button so the user can try again
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
      shakeForm();
    });
  });

  function isValidEmail (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function shakeForm () {
    contactForm.style.animation = 'shake 0.4s ease';
    setTimeout(() => { contactForm.style.animation = ''; }, 400);
  }


  /* ================================================
     7. DESTINATION & PACKAGE card hover — tilt effect
     ================================================ */
  document.querySelectorAll('.dest-card, .pkg-card').forEach(card => {
    card.addEventListener('mousemove', function (e) {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-8px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg)`;
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });


  /* ================================================
     8. Navbar Logo — click returns to top
     ================================================ */
  document.querySelector('.logo').addEventListener('click', function (e) {
    if (this.getAttribute('href') === '#home') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });


  /* ================================================
     CSS animation for form shake (injected)
     ================================================ */
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-8px); }
      40%       { transform: translateX(8px); }
      60%       { transform: translateX(-6px); }
      80%       { transform: translateX(6px); }
    }
  `;
  document.head.appendChild(styleEl);

});
