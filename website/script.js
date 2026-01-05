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

// Scroll to bottom after adding a message
function scrollChatToBottom() {
  setTimeout(() => {
    chatbotMessagesEl.scrollTop = chatbotMessagesEl.scrollHeight;
  }, 50); // slight delay ensures DOM updates
}

// Format text to preserve line breaks inside bubbles
function formatMessage(text) {
  return text.replace(/\n/g, "<br>");
}

// Predefined local responses
const LOCAL_RESPONSES = {
  help: `Available commands:
- resume : Get a link to my resume
- skills : See my skills and tools
- projects : Learn about my projects
- email : Send me a message`,
};

// Send message on Enter
chatbotInputEl.addEventListener("keydown", async (e) => {
  if (e.key === "Enter" && chatbotInputEl.value.trim() !== "") {
    const userMessage = chatbotInputEl.value.trim();
    const lowerMsg = userMessage.toLowerCase();

    // Show user message
    chatbotMessagesEl.innerHTML += `
      <div class="user-msg">
        <span class="msg-label">You</span>
        <div class="msg-text">${formatMessage(userMessage)}</div>
      </div>
    `;
    chatbotInputEl.value = "";
    scrollChatToBottom();

    // Handle local responses first
    // Handle local responses first
if (LOCAL_RESPONSES[lowerMsg]) {
  chatbotMessagesEl.innerHTML += `
    <div class="bot-msg">
      <span class="msg-label">Chatbot</span>
      <div class="msg-text">${formatMessage(LOCAL_RESPONSES[lowerMsg])}</div>
    </div>
  `;
  scrollChatToBottom();
  return;
}

// For unrecognized commands, show error without calling Lambda
const recognizedCommands = ["help", "resume", "skills", "projects", "email"];
if (!recognizedCommands.includes(lowerMsg)) {
  chatbotMessagesEl.innerHTML += `
    <div class="bot-msg">
      <span class="msg-label">Chatbot</span>
      <div class="msg-text">
        Oops! I couldn't understand that. <br>
        Please use one of the available commands. <br>
        Type "help" to see the list of commands.
      </div>
    </div>
  `;
  scrollChatToBottom();
  return;
}

// Otherwise, call Lambda
try {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage }),
  });


      const data = await response.json();
      let botReply = data.reply?.trim();

      // If Lambda didn't return a reply, show friendly error
      if (!botReply) {
        botReply = `Oops! I couldn't understand that. 
Please use one of the available commands. 
Type "help" to see the list of commands.`;
      }

      chatbotMessagesEl.innerHTML += `
        <div class="bot-msg">
          <span class="msg-label">Chatbot</span>
          <div class="msg-text">${formatMessage(botReply)}</div>
        </div>
      `;
      scrollChatToBottom();

    } catch (err) {
      console.error("Error calling chatbot API:", err);
      chatbotMessagesEl.innerHTML += `
        <div class="bot-msg">
          <span class="msg-label">Chatbot</span>
          <div class="msg-text">Error: Could not reach chatbot. Please try again later.</div>
        </div>
      `;
      scrollChatToBottom();
    }
  }
});

// Chatbot modal open/close
const chatbotBtn = document.getElementById('chatbot-button');
const chatbotModal = document.getElementById('chatbot-modal');
const chatbotClose = document.getElementById('chatbot-close');

chatbotBtn.addEventListener('click', () => {
  chatbotModal.style.display = 'flex';

  // Only show welcome message if chat is empty
  if (chatbotMessagesEl.innerHTML.trim() === "") {
    chatbotMessagesEl.innerHTML += `
      <div class="bot-msg">
        <span class="msg-label">Chatbot</span>
        <div class="msg-text">
          Hi, my name is Chatbot. Type "help" to see available options.
        </div>
      </div>
    `;
    scrollChatToBottom();
  }
});

chatbotClose.addEventListener('click', () => {
  chatbotModal.style.display = 'none';
});

// Open chatbot modal when "Try it" is clicked
const tryChatbotBtns = document.querySelectorAll('.open-chatbot');

tryChatbotBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    chatbotModal.style.display = 'flex';

    // Only show welcome message if chat is empty
    if (chatbotMessagesEl.innerHTML.trim() === "") {
      chatbotMessagesEl.innerHTML += `
        <div class="bot-msg">
          <span class="msg-label">Chatbot</span>
          <div class="msg-text">
            Hi, my name is Chatbot. Type "help" to see available options.
          </div>
        </div>
      `;
      scrollChatToBottom();
    }
  });
});