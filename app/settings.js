const themesEl = document.getElementById('themes');
let current = '🚗';
function render(themes) {
  themesEl.replaceChildren();
  themes.forEach(theme => {
    const button = document.createElement('button');
    button.className = 'theme' + (theme === current ? ' active' : '');
    button.textContent = theme;
    button.title = 'Select ' + theme;
    button.setAttribute('aria-pressed', String(theme === current));
    button.addEventListener('click', () => {
      current = theme;
      window.orbit.setTheme(theme);
      render(themes);
    });
    themesEl.appendChild(button);
  });
}
window.orbit.getState().then(state => {
  current = state.selectedTheme;
  render(state.themes);
  document.getElementById('enabled').checked = state.buddyEnabled;
});
window.orbit.onThemeChanged(theme => {
  current = theme;
  window.orbit.getState().then(state => render(state.themes));
});
document.getElementById('enabled').addEventListener('change', event => window.orbit.setBuddyEnabled(event.target.checked));
document.getElementById('shutdownNow').addEventListener('click', () => window.orbit.showShutdownWarning());
document.getElementById('quit').addEventListener('click', () => window.orbit.quitApp());
