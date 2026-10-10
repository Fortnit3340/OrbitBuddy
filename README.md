# Orbit Buddy

Orbit Buddy is a Windows desktop companion with draggable emoji/character themes, a tray menu, settings, an on/off control, and a custom pre-shutdown animation. The matching responsive landing page is in `website/index.html`.

## Features

- Eight selectable buddy characters: 🚗 😎 🐱 🦊 🤖 🪐 🐸 👻.
- Always-on-top transparent desktop companion that can be dragged between monitors.
- Right-click the buddy to open Settings; double-click it to open the shutdown warning.
- System-tray menu for settings, showing/hiding the buddy, shutdown warning, and quitting the app.
- Custom shutdown animation with a cancel button before Windows shutdown is requested.
- Installer configured to create Start Menu and Desktop shortcuts.
- GitHub Actions workflow to build a Windows installer on GitHub-hosted Windows runners.
- Firebase Hosting configuration for the website.

## Important limitations

Windows does not provide a safe, universal API for a regular desktop app to list every unsaved document or form in every other app. The shutdown warning therefore gives a checklist reminder; it does **not** claim to detect all unsaved work. Orbit plays its own animation before requesting shutdown, but it cannot replace the native Windows shutdown screen. The user can cancel during the animation; once Windows has accepted the shutdown request, cancellation may no longer be possible.

## Run locally on Windows

Install Node.js 22 or newer, then open a terminal in the project directory:

```powershell
npm install
npm start
```

To build the Windows installer locally:

```powershell
npm run dist
```

The installer should be written to `dist/Orbit-Buddy-Setup-1.0.0.exe` for this version. A successful build has **not** been verified in this environment because package installation did not complete here; run the commands on Windows or use the GitHub Actions workflow below.

## Build on GitHub without building locally

1. Create a new GitHub repository and upload the project contents.
2. Open the repository's **Actions** tab and enable Actions if prompted.
3. Choose **Build Windows installer** and click **Run workflow**.
4. Open the completed workflow run and download the `Orbit-Buddy-Windows-Installer` artifact.
5. To publish a GitHub Release automatically, create and push a version tag such as `v1.0.0`; the workflow attaches the installer to that release.

## Publish the website

### GitHub Pages

Publish the `website` folder using your repository's Pages settings, or copy `website/index.html` into the publishing root. The download button intentionally stays in setup mode until the real installer URL is configured.

### Firebase Hosting

The included `firebase.json` sets `website` as the public directory. From the project folder, install/use the Firebase CLI, run `firebase login`, then `firebase init hosting` only if you need to connect the project to your Firebase site. Preserve the existing `firebase.json`, select the correct Firebase project, and deploy with `firebase deploy --only hosting`.

## Configure the download button

Before publishing the website, open `website/index.html` and replace `YOUR_INSTALLER_DOWNLOAD_URL` in the `INSTALLER_URL` constant with the **real public URL** of the installer in your GitHub Release or Firebase Storage. Do not use a placeholder or a local file path. The app binary cannot be hosted for you without access to your GitHub/Firebase account.

## Security notes

The app uses Electron context isolation, disables Node integration in renderer windows, and exposes a small explicit API through `preload.js`. The shutdown command is only run on Windows and only after the warning and animation flow. Review source and build artifacts before distributing the installer.
