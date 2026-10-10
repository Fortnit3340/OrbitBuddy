const warning = document.getElementById('warningView');
const animation = document.getElementById('animation');
const status = document.getElementById('status');
let timer = null;
let interval = null;
document.getElementById('cancel').addEventListener('click', () => window.orbit.cancelShutdown());
document.getElementById('continue').addEventListener('click', () => {
  warning.classList.add('hidden');
  animation.classList.remove('hidden');
  window.orbit.startShutdownAnimation();
});
document.getElementById('abort').addEventListener('click', () => {
  if (timer) clearTimeout(timer);
  if (interval) clearInterval(interval);
  window.orbit.cancelShutdown();
});
window.orbit.onPlayShutdownAnimation(() => {
  const messages = ['Taking one last look at your orbit…', 'Sending your buddy into space…', 'See you next time.'];
  let index = 0;
  status.textContent = messages[0];
  interval = setInterval(() => {
    index += 1;
    status.textContent = messages[Math.min(index, messages.length - 1)];
    if (index >= messages.length - 1) clearInterval(interval);
  }, 1500);
  timer = setTimeout(() => window.orbit.performShutdown(), 5000);
});
window.orbit.onShutdownError(message => {
  if (timer) clearTimeout(timer);
  if (interval) clearInterval(interval);
  status.textContent = message;
  document.getElementById('abort').textContent = 'Close';
  document.getElementById('abort').onclick = () => window.orbit.cancelShutdown();
});
