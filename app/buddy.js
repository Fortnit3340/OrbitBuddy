const orb = document.getElementById('orb');
const buddy = document.getElementById('buddy');
let dragging = false;
let moved = false;
let start = null;
let lastMoveAt = 0;
window.orbit.getState().then(state => { orb.textContent = state.selectedTheme; });
window.orbit.onThemeChanged(theme => { orb.textContent = theme; });
buddy.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  dragging = true;
  moved = false;
  start = { x: event.screenX, y: event.screenY };
  buddy.setPointerCapture(event.pointerId);
  buddy.style.cursor = 'grabbing';
});
buddy.addEventListener('pointermove', event => {
  if (!dragging || !start) return;
  const dx = event.screenX - start.x;
  const dy = event.screenY - start.y;
  if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
  if (moved) {
    window.orbit.moveBuddy({ x: event.screenX - 52, y: event.screenY - 58 });
    start = { x: event.screenX, y: event.screenY };
    lastMoveAt = Date.now();
  }
});
function endDrag() {
  dragging = false;
  start = null;
  buddy.style.cursor = 'grab';
  setTimeout(() => { moved = false; }, 180);
}
buddy.addEventListener('pointerup', endDrag);
buddy.addEventListener('pointercancel', endDrag);
buddy.addEventListener('dblclick', event => {
  if (Date.now() - lastMoveAt < 250) return;
  window.orbit.showShutdownWarning();
});
buddy.addEventListener('contextmenu', event => {
  event.preventDefault();
  window.orbit.openSettings();
});
