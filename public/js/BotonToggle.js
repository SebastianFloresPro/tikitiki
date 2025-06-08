document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle');
  const menu = document.getElementById('menu');

  if (!toggle || !menu) return; 

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });

  window.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = 'none';
    }
  });
});