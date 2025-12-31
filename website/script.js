// Navbar scroll behavior and scroll spy
const navbar = document.querySelector('.navbar');
const hero = document.querySelector('#hero');
const navLinks = document.querySelectorAll('.navbar nav ul li a');
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
  if (window.scrollY >= hero.offsetHeight - navbar.offsetHeight) {
    navbar.classList.add('fixed-top');
  } else {
    navbar.classList.remove('fixed-top');
  }

  sections.forEach(section => {
    const top = window.scrollY;
    const offset = section.offsetTop - navbar.offsetHeight - 10;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (top >= offset && top < offset + height) {
      navLinks.forEach(link => link.classList.remove('active'));
      document.querySelector(`.navbar nav ul li a[href="#${id}"]`)?.classList.add('active');
    }
  });
});

// Smooth scroll
const scrollLinks = document.querySelectorAll('.navbar nav ul li a, .hero-button');
scrollLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    window.scrollTo({ top: targetSection.offsetTop - navbar.offsetHeight, behavior: 'smooth' });
  });
});

// Hero button animation
const heroButton = document.querySelector('.hero-button');
window.addEventListener('load', () => setTimeout(() => heroButton.classList.add('show'), 500));

// Project card scroll animation
const projectCards = document.querySelectorAll('.project-card');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) { entry.target.classList.add('show'); }
  });
}, { threshold: 0.3 });
projectCards.forEach(card => observer.observe(card));

// Chatbot functionality
const chatbotBtn = document.getElementById('chatbot-button');
const chatbotModal = document.getElementById('chatbot-modal');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotMessages = document.getElementById('chatbot-messages');

chatbotBtn.addEventListener('click', () => { chatbotModal.style.display = 'flex'; });
chatbotClose.addEventListener('click', () => { chatbotModal.style.display = 'none'; });

// Simple echo chatbot for demo
chatbotInput.addEventListener('keydown', e => {
  if(e.key === 'Enter' && chatbotInput.value.trim() !== '') {
    const msg = document.createElement('div');
    msg.textContent = "You: " + chatbotInput.value;
    chatbotMessages.appendChild(msg);

    const reply = document.createElement('div');
    reply.textContent = "Bot: I received \"" + chatbotInput.value + "\"";
    chatbotMessages.appendChild(reply);

    chatbotInput.value = '';
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }
});
// About section scroll animation
const aboutSection = document.querySelector('.about-text');
const aboutObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
}, { threshold: 0.3 });

aboutObserver.observe(aboutSection);
