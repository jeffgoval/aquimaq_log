import sharp from 'sharp'
import { renameSync, unlinkSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')

async function roundCorners(filename, size) {
  const radius = Math.round(size * 0.225)

  const mask = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/>
    </svg>`
  )

  const input = path.join(publicDir, filename)
  const tmp   = path.join(publicDir, filename + '.tmp.png')

  await sharp(input)
    .resize(size, size)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toFile(tmp)

  unlinkSync(input)
  renameSync(tmp, input)

  console.log(`✓ ${filename} — r=${radius}px`)
}

await roundCorners('icon-192.png', 192)
await roundCorners('icon-512.png', 512)
console.log('Ícones corrigidos!')
