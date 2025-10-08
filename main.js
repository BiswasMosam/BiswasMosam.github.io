// Section fade-in on scroll
const sections = document.querySelectorAll('section');
const options = { threshold: 0.1 };
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, options);
sections.forEach(section => {
  observer.observe(section);
});

// Typing effect for hero section
const text = '> Hi, I\'m Mosam Biswas';
const typingElement = document.getElementById('typing-text');
let index = 0;
function type() {
  if (index < text.length) {
    typingElement.innerHTML += text.charAt(index);
    index++;
    setTimeout(type, 100);
  } else {
    setTimeout(() => {
      typingElement.innerHTML = '';
      index = 0;
      type();
    }, 10000);
  }
}
window.addEventListener('load', type);

// Secret double-click on "Mosam Biswas" opens photography page
document.getElementById('mosam-link').ondblclick = function() {
  window.open('sheichobi.html', '_blank');
};

// Certificate modal logic
function openCertModal(src) {
  document.getElementById('certModalImg').src = src;
  document.getElementById('certModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeCertModal() {
  document.getElementById('certModal').style.display = 'none';
  document.body.style.overflow = '';
}
document.getElementById('certModal').onclick = function(e) {
  if (e.target === this) closeCertModal();
};
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeCertModal();
});