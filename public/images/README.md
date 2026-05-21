# Images

Drop any image files (`.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`) into this folder.

Vite serves everything inside `public/` as a static asset, so a file at:

```
public/images/hero-worker.jpg
```

is reachable in the app at the URL:

```
/images/hero-worker.jpg
```

## Using an image in JSX

```jsx
<img src="/images/hero-worker.jpg" alt="Pronto worker" />
```

## Using as a CSS background

```jsx
<div
  className="bg-cover bg-center"
  style={{ backgroundImage: "url('/images/hero-worker.jpg')" }}
/>
```

## Suggested filenames (used / referenced across the site)

Hero / branding
- `hero-worker.png` — the smiling worker illustration on the hero (replaces the inline SVG)
- `logo.svg` — Pronto logo

Service tiles (one per service, ~512×512, transparent or white bg)
- `services/hourly.png`
- `services/bathroom.png`
- `services/fridge.png`
- `services/packing.png`
- `services/utensils.png`
- `services/kitchen-prep.png`
- `services/dusting.png`
- `services/sweeping-mopping.png`
- `services/pre-party.png`
- `services/wardrobe.png`
- `services/after-party.png`
- `services/ironing.png`
- `services/window.png`
- `services/laundry.png`
- `services/kitchen-cleaning.png`
- `services/balcony.png`
- `services/fan.png`
- `services/kitchen-cabinet.png`

Press / "as featured in" strip
- `press/techcrunch.svg`
- `press/yourstory.svg`
- `press/inc42.svg`
- `press/forbes.svg`
- `press/economic-times.svg`
- `press/yc.svg`

Phone mockup screens (optional)
- `app/home.png`
- `app/services.png`
- `app/booking.png`
- `app/tracking.png`

City covers (optional, 1200×800)
- `cities/bangalore.jpg`
- `cities/delhi.jpg`
- `cities/mumbai.jpg`
- … etc.

Tell me when files are dropped in and I'll wire them into the relevant components.
