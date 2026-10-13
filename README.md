# RegressLab — Interactive Regression Explorer

A responsive educational website demonstrating simple linear regression using HTML, CSS, JavaScript, and Plotly.js.

## Features
- Responsive white-and-blue design with top navigation
- Four sample datasets
- Interactive scatterplot and least-squares regression line
- Optional residual lines and approximate confidence band
- Editable X/Y observations, add/delete rows
- Live slope, intercept, R-squared, RMSE, and predictions
- CSV export
- No backend; data stays in the browser

## Run locally
1. Download or unzip this project.
2. Open `index.html` in a modern browser. An internet connection is needed to load Plotly.js from its CDN.
3. For a local development server, open this folder in VS Code and use a static server extension if you have one installed.

## Publish on GitHub Pages
1. Sign in at https://github.com/ and create a **public** repository, e.g. `regresslab-explorer`.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then save.
6. Wait for the deployment to finish. Your URL will look like `https://YOUR-USERNAME.github.io/regresslab-explorer/`.
7. Open that URL in an incognito/private window to verify it is public.
8. Submit the live URL and repository URL to Google Classroom.

## Attribution and academic integrity
This is an original educational implementation inspired by the idea of an interactive regression explorer. If you borrow code, content, or assets from another project, check its license and credit the source. Do not present copied work as entirely your own.
