// Generates source images for @capacitor/assets:
//   assets/icon-only.png       1024x1024  (full bleed, brand color + "H")
//   assets/icon-foreground.png 1024x1024  (transparent bg, centered "H" within safe area)
//   assets/icon-background.png 1024x1024  (solid brand color)
//   assets/splash.png          2732x2732  (brand bg, centered "Helpr")
//   assets/splash-dark.png     2732x2732  (dark bg, centered "Helpr")
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const BRAND = '#16a34a'
const DARK = '#0a0a0a'
const WHITE = '#ffffff'

await mkdir('assets', { recursive: true })

const iconSvg = (opts) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${opts.bg ? `<rect width="1024" height="1024" fill="${opts.bg}"/>` : ''}
  <text x="512" y="512" text-anchor="middle" dominant-baseline="central"
    font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    font-size="${opts.fontSize ?? 640}" font-weight="800" fill="${opts.fill}">H</text>
</svg>`

const splashSvg = (bg, fg) => `
<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
  <rect width="2732" height="2732" fill="${bg}"/>
  <text x="1366" y="1366" text-anchor="middle" dominant-baseline="central"
    font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    font-size="420" font-weight="800" fill="${fg}">Helpr</text>
</svg>`

async function svgToPng(svg, out) {
  await sharp(Buffer.from(svg)).png().toFile(out)
  console.log('wrote', out)
}

await svgToPng(iconSvg({ bg: BRAND, fill: WHITE }),                         'assets/icon-only.png')
await svgToPng(iconSvg({ bg: null,  fill: WHITE, fontSize: 520 }),          'assets/icon-foreground.png')
await svgToPng(iconSvg({ bg: BRAND, fill: BRAND }),                         'assets/icon-background.png')
await svgToPng(splashSvg(BRAND, WHITE),                                     'assets/splash.png')
await svgToPng(splashSvg(DARK, WHITE),                                      'assets/splash-dark.png')
