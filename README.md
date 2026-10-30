# Weather App

A static weather app built with HTML, CSS, and JavaScript. It uses Open-Meteo geocoding and forecast APIs, so there is no API key to configure. The app supports city search and current-location weather. Location access requires HTTPS (or localhost).

## Run locally

Open `index.html` in a browser, or serve this folder with any static file server. For example, with Python:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy

The included GitHub Actions workflow publishes the repository root to GitHub Pages automatically whenever a commit is pushed to `main`. No build command or environment variables are required. In repository **Settings → Pages**, set the source to **GitHub Actions** if it is not already selected.

## Notes

- Open-Meteo provides the weather and geocoding data. Review its current terms and usage limits before high-traffic use.
- Browser geolocation prompts users for permission and only works on HTTPS or localhost.
