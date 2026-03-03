const revealElements = document.querySelectorAll('.reveal');
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const timelineItems = document.querySelectorAll('.interactive-item');
const statNumbers = document.querySelectorAll('.stat-number');
const themeToggle = document.getElementById('theme-toggle');
const dialog = document.getElementById('project-dialog');
const dialogTitle = document.getElementById('dialog-title');
const dialogText = document.getElementById('dialog-text');
const closeDialog = document.getElementById('close-dialog');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealElements.forEach((element) => observer.observe(element));

const tiltCards = document.querySelectorAll('.tilt-card');

function applyTilt(event, card) {
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const rotateX = (y / rect.height - 0.5) * -10;
  const rotateY = (x / rect.width - 0.5) * 12;

  card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

tiltCards.forEach((card) => {
  card.addEventListener('mousemove', (event) => applyTilt(event, card));
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(700px) rotateX(0) rotateY(0)';
  });
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    projectCards.forEach((card) => {
      const shouldShow = filter === 'all' || card.dataset.category === filter;
      card.style.display = shouldShow ? 'block' : 'none';
    });
  });
});

document.querySelectorAll('.mini-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.project-card');
    dialogTitle.textContent = card.querySelector('h3').textContent;
    dialogText.textContent = button.dataset.details;
    dialog.showModal();
  });
});

closeDialog.addEventListener('click', () => dialog.close());

dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  const isOutside =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;

  if (isOutside) {
    dialog.close();
  }
});

timelineItems.forEach((item) => {
  item.addEventListener('click', () => {
    timelineItems.forEach((current) => current.classList.remove('active'));
    item.classList.add('active');
  });
});

function animateCounter(element) {
  const target = Number(element.dataset.target);
  const duration = 1100;
  let start = null;

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    element.textContent = Math.floor(progress * target);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

statNumbers.forEach((stat) => animateCounter(stat));

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('glow-mode');
});

const canvas = document.getElementById('particle-canvas');
const context = canvas.getContext('2d');

let particles = [];

function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  const count = Math.min(90, Math.floor(window.innerWidth / 14));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 0.4,
    speedX: (Math.random() - 0.5) * 0.35,
    speedY: (Math.random() - 0.5) * 0.35,
  }));
}

function drawParticles() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(174, 231, 255, 0.7)';

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
