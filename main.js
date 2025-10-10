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
  window.open('sheichobi/sheichobi.html', '_blank');
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

function blobPath(cx, cy, r, t, points = 32, wobble = 13, freq = 1.9) {
  let d = '';
  for (let i = 0; i < 360; i += 360 / points) {
    let rad = (i * Math.PI) / 180;
    let offset = Math.sin(rad * freq + t) * wobble;
    let x = cx + Math.cos(rad) * (r + offset);
    let y = cy + Math.sin(rad) * (r + offset);
    d += (i === 0 ? 'M' : 'L') + x + ',' + y + ' ';
  }
  d += 'Z';
  return d;
}

function animateBlobs() {
  const t = Date.now() / 900;
  document.getElementById('blob1').setAttribute('d', blobPath(320 + Math.sin(t)*70, 220 + Math.cos(t/2.9)*40, 120, t));
  document.getElementById('blob2').setAttribute('d', blobPath(700 + Math.cos(t/2)*60, 400 + Math.sin(t/2.9)*60, 140, t+2));
  document.getElementById('blob3').setAttribute('d', blobPath(500 + Math.sin(t/1.5)*50, 600 + Math.cos(t/2.9)*50, 100, t+4));
  document.getElementById('blob4').setAttribute('d', blobPath(900 + Math.sin(t/1.3)*50, 200 + Math.cos(t/2.9)*50, 90, t+6));
  document.getElementById('blob5').setAttribute('d', blobPath(200 + Math.cos(t/1.7)*60, 650 + Math.sin(t/2.9)*60, 80, t+8));
  document.getElementById('blob6').setAttribute('d', blobPath(600 + Math.sin(t/1.2)*55, 150 + Math.cos(t/2.9)*55, 85, t+10));
  // Move silver blob to right bottom area
  document.getElementById('blob7').setAttribute('d', blobPath(1050 + Math.sin(t/1.4)*70, 500 + Math.cos(t/2.9)*70, 75, t+12));
  requestAnimationFrame(animateBlobs);
}
animateBlobs();