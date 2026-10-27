import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { v2 as cloudinary } from 'cloudinary'
import { isAuthorized } from '@/lib/admin-auth'

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || ''
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || ''
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || ''

const cloudinaryConfigured = !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  })
}

async function addWatermark(buffer: Buffer): Promise<Buffer> {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.jpg')
    const hasLogo = fs.existsSync(logoPath)
    const image = sharp(buffer)
    const metadata = await image.metadata()
    const width = metadata.width || 800
    const height = metadata.height || 600
    const logoWidth = Math.max(40, Math.round(width * 0.08))

    if (hasLogo) {
      const logoBuffer = fs.readFileSync(logoPath)
      const resizedLogo = await sharp(logoBuffer)
        .resize(logoWidth, null, { fit: 'inside' })
        .composite([{
          input: Buffer.from(
            `<svg width="${logoWidth}" height="${logoWidth}"><rect width="${logoWidth}" height="${logoWidth}" fill="white" rx="6"/></svg>`
          ),
          blend: 'dest-in',
        }])
        .png()
        .toBuffer()

      const logoMeta = await sharp(resizedLogo).metadata()
      const logoHeight = logoMeta.height || logoWidth
      const padding = Math.round(width * 0.02)

      return await image
        .composite([{
          input: resizedLogo,
          left: Math.max(0, width - logoWidth - padding),
          top: Math.max(0, height - logoHeight - padding),
          blend: 'over',
        }])
        .toBuffer()
    }

    const svgText = `<svg width="${width}" height="${height}">
      <style>.wm { fill: rgba(255,255,255,0.7); font-size: ${Math.max(12, Math.round(width * 0.025))}px; font-family: Arial, sans-serif; font-weight: bold; }</style>
      <rect x="${width - Math.round(width * 0.22)}" y="${height - Math.round(height * 0.06)}" width="${Math.round(width * 0.2)}" height="${Math.round(height * 0.04)}" fill="rgba(0,51,153,0.6)" rx="4"/>
      <text x="${width - Math.round(width * 0.12)}" y="${height - Math.round(height * 0.03)}" text-anchor="middle" class="wm">GOAL ZONE TV</text>
    </svg>`

    return await image
      .composite([{ input: Buffer.from(svgText), blend: 'over' }])
      .toBuffer()
  } catch (err) {
    console.warn('[upload watermark] erreur:', err)
    return buffer
  }
}

const MAX_IMAGE_SIZE = 15 * 1024 * 1024
const MAX_VIDEO_SIZE = 100 * 1024 * 1024
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'heif']
const VIDEO_EXTS = ['mp4', 'webm', 'mov', 'avi', 'm4v', '3gp']

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 })
    }

    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Type non supporté. Images: JPG, PNG, GIF, WebP. Vidéos: MP4, WebM, MOV.' },
        { status: 400 }
      )
    }

    const ext = (file.name.split('.').pop() || '').toLowerCase()
    const validExt = isImage ? IMAGE_EXTS : VIDEO_EXTS
    const finalExt = validExt.includes(ext) ? ext : (isImage ? 'png' : 'mp4')

    const max = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
    if (file.size > max) {
      return NextResponse.json(
        { error: `Fichier trop volumineux. Max: ${Math.round(max / (1024 * 1024))} Mo.` },
        { status: 413 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const rawBuffer = Buffer.from(arrayBuffer)
    const buffer = isImage ? await addWatermark(rawBuffer) : rawBuffer
    const baseName = `media-${Date.now()}`
    const sizeMo = Math.round((buffer.length / (1024 * 1024)) * 100) / 100

    if (cloudinaryConfigured) {
      try {
        const resourceType = isVideo ? 'video' : 'image'
        const folder = isVideo ? 'goal-zone-tv/videos' : 'goal-zone-tv/articles'
        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: resourceType, folder, public_id: baseName, overwrite: true },
            (error, result) => {
              if (error) reject(error)
              else if (result) resolve({ secure_url: result.secure_url })
              else reject(new Error('Cloudinary: aucun résultat'))
            }
          )
          uploadStream.end(buffer)
        })

        return NextResponse.json({
          mediaUrl: result.secure_url,
          mediaType: isImage ? 'image' : 'video',
          originalName: file.name,
          size: file.size,
          sizeMo,
          storage: 'cloudinary',
        })
      } catch (cloudinaryError) {
        console.error('[upload] Cloudinary erreur, fallback local:', cloudinaryError)
      }
    }

    // Fallback local
    const subdir = isImage ? 'articles' : 'videos'
    const prefix = isImage ? 'img' : 'vid'
    const filename = `${prefix}-${Date.now()}.${finalExt}`
    const dir = path.join(process.cwd(), 'public', subdir)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, filename), buffer)

    return NextResponse.json({
      mediaUrl: `/${subdir}/${filename}`,
      mediaType: isImage ? 'image' : 'video',
      originalName: file.name,
      size: file.size,
      sizeMo,
      storage: 'local',
    })
  } catch (error) {
    console.error('[API upload] error', error)
    return NextResponse.json(
      { error: `Upload échoué : ${error instanceof Error ? error.message : 'erreur'}` },
      { status: 500 }
    )
  }
}
