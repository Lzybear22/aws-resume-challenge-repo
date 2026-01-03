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

// Chatbot input & messages
const chatbotInputEl = document.getElementById("chatbot-input");
const chatbotMessagesEl = document.getElementById("chatbot-messages");

const API_URL = CONFIG.API_URL;

// Send message on Enter
chatbotInputEl.addEventListener("keydown", async (e) => {
  if (e.key === "Enter" && chatbotInputEl.value.trim() !== "") {
    const userMessage = chatbotInputEl.value;

    // Show user message
    chatbotMessagesEl.innerHTML += `<div class="user-msg">You: ${userMessage}</div>`;
    chatbotInputEl.value = "";

    try {
      // Call Lambda Function URL
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });

      // Lambda Function URL already returns JSON directly
      const data = await response.json();
      const botReply = data.reply || "Hmm, I didn't get that.";

      // Show bot reply
      chatbotMessagesEl.innerHTML += `<div class="bot-msg">Bot: ${botReply}</div>`;
      chatbotMessagesEl.scrollTop = chatbotMessagesEl.scrollHeight;

    } catch (err) {
      console.error("Error calling chatbot API:", err);
      chatbotMessagesEl.innerHTML += `<div class="bot-msg">Error: Could not reach chatbot.</div>`;
    }
  }
});

// Chatbot modal open/close
const chatbotBtn = document.getElementById('chatbot-button');
const chatbotModal = document.getElementById('chatbot-modal');
const chatbotClose = document.getElementById('chatbot-close');

chatbotBtn.addEventListener('click', () => {
  chatbotModal.style.display = 'flex';
});

chatbotClose.addEventListener('click', () => {
  chatbotModal.style.display = 'none';
});
