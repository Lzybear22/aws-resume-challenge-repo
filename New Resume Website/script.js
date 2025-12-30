document.addEventListener('DOMContentLoaded', () => {
  const fadeSections = document.querySelectorAll('.fade-in');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  // Fade-in observer
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.2 });
  fadeSections.forEach(section => observer.observe(section));

  // Highlight nav on scroll
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if(scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if(link.getAttribute('href') === '#' + current){
        link.classList.add('active');
      }
    });
  });
});
