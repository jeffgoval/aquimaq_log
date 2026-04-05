/** Redimensiona e exporta JPEG para uploads leves (notas/recibos no celular). */
export async function compressImageToJpeg(
  file: File,
  maxEdgePx = 1600,
  quality = 0.85
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  try {
    const maxSide = Math.max(bitmap.width, bitmap.height)
    const ratio = maxSide <= maxEdgePx ? 1 : maxEdgePx / maxSide
    const w = Math.round(bitmap.width * ratio)
    const h = Math.round(bitmap.height * ratio)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D não disponível')
    ctx.drawImage(bitmap, 0, 0, w, h)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
    )
    if (!blob) throw new Error('Falha ao gerar imagem')
    return blob
  } finally {
    bitmap.close()
  }
}
