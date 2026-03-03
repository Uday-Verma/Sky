const revealElements = document.querySelectorAll('.reveal');
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const timelineItems = document.querySelectorAll('.interactive-item');
const themeToggle = document.getElementById('theme-toggle');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealElements.forEach((element) => observer.observe(element));

function applyTilt(event, card) {
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const rotateX = (y / rect.height - 0.5) * -8;
  const rotateY = (x / rect.width - 0.5) * 10;

  card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

document.querySelectorAll('.tilt-card').forEach((card) => {
  card.addEventListener('mousemove', (event) => applyTilt(event, card));
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
  });
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    projectCards.forEach((card) => {
      const visible = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('is-hidden', !visible);
    });
  });
});

timelineItems.forEach((item) => {
  item.addEventListener('click', () => {
    timelineItems.forEach((current) => current.classList.remove('active'));
    item.classList.add('active');
  });
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
});

const canvas = document.getElementById('particle-canvas');
const context = canvas.getContext('2d');
let particles = [];

function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  const count = Math.min(85, Math.floor(window.innerWidth / 15));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 0.4,
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: (Math.random() - 0.5) * 0.3,
  }));
}

function drawParticles() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(174, 231, 255, 0.55)';

  particles.forEach((particle) => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
    if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

    context.beginPath();
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    context.fill();
  });

  requestAnimationFrame(drawParticles);
}

setCanvasSize();
createParticles();
drawParticles();

window.addEventListener('resize', () => {
  setCanvasSize();
  createParticles();
});
