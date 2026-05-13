import sharp from 'sharp'
import { readFileSync } from 'fs'

const svg = readFileSync('public/favicon.svg')

// Regular icons
await sharp(svg).resize(192, 192).png().toFile('public/icon-192.png')
await sharp(svg).resize(512, 512).png().toFile('public/icon-512.png')

// Maskable icon: add 20% safe-zone padding (white/transparent bg won't work, use theme bg)
const maskableSize = 512
const iconSize = Math.round(maskableSize * 0.8)
const offset = Math.round((maskableSize - iconSize) / 2)

const resized = await sharp(svg).resize(iconSize, iconSize).png().toBuffer()
await sharp({
  create: { width: maskableSize, height: maskableSize, channels: 4, background: { r: 30, g: 30, b: 46, alpha: 1 } },
})
  .composite([{ input: resized, left: offset, top: offset }])
  .png()
  .toFile('public/icon-maskable-512.png')

// Apple touch icon (180x180)
await sharp(svg).resize(180, 180).png().toFile('public/apple-touch-icon.png')

console.log('Icons generated successfully')
