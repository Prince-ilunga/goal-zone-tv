import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { v2 as cloudinary } from 'cloudinary'
import { isAuthorized } from '@/lib/admin-auth'

// Configuration Cloudinary (si les variables sont présentes, on utilise Cloudinary)
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
  console.log('[upload] Cloudinary configuré :', CLOUDINARY_CLOUD_NAME)
}

// POST /api/upload — import d'un fichier depuis la galerie (image ou vidéo)
// Si Cloudinary est configuré → upload vers Cloudinary (persistance production)
// Sinon → fallback local dans /public (dev local)
const MAX_IMAGE_SIZE = 15 * 1024 * 1024 // 15 Mo
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100 Mo

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
        { error: 'Type de fichier non supporté. Formats acceptés : images (JPG, PNG, GIF, WebP) et vidéos (MP4, WebM, MOV).' },
        { status: 400 }
      )
    }

    const ext = (file.name.split('.').pop() || '').toLowerCase()
    const validExt = isImage ? IMAGE_EXTS : VIDEO_EXTS
    const finalExt = validExt.includes(ext) ? ext : (isImage ? 'png' : 'mp4')

    const max = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
    if (file.size > max) {
      const limitMo = Math.round(max / (1024 * 1024))
      return NextResponse.json(
        { error: `Fichier trop volumineux (${Math.round(file.size / (1024 * 1024))} Mo). Maximum autorisé : ${limitMo} Mo.` },
        { status: 413 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const baseName = `media-${Date.now()}`
    const fileName = `${baseName}.${finalExt}`
    const sizeMo = Math.round((file.size / (1024 * 1024)) * 100) / 100

    // -------- Méthode 1 : Cloudinary (production) --------
    if (cloudinaryConfigured) {
      try {
        const resourceType = isVideo ? 'video' : 'image'
        const folder = isVideo ? 'goal-zone-tv/videos' : 'goal-zone-tv/articles'
        const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: resourceType,
              folder,
              public_id: baseName,
              overwrite: true,
            },
            (error, result) => {
              if (error) reject(error)
              else if (result) resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
              })
              else reject(new Error('Aucun résultat Cloudinary'))
            }
          )
          uploadStream.end(buffer)
        })

        return NextResponse.json({
          mediaUrl: result.secure_url,           // URL Cloudinary permanente
          mediaType: isImage ? 'image' : 'video',
          originalName: file.name,
          size: file.size,
          sizeMo,
          storage: 'cloudinary',
        })
      } catch (cloudinaryError) {
        console.error('[upload] Erreur Cloudinary, fallback local :', cloudinaryError)
        // On continue vers le fallback local
      }
    }

    // -------- Méthode 2 : Fallback local (dev local sans Cloudinary) --------
    const subdir = isImage ? 'articles' : 'videos'
    const prefix = isImage ? 'img' : 'vid'
    const filename = `${prefix}-${Date.now()}.${finalExt}`
    const dir = path.join(process.cwd(), 'public', subdir)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, filename), buffer)

    const mediaUrl = `/${subdir}/${filename}`
    return NextResponse.json({
      mediaUrl,
      mediaType: isImage ? 'image' : 'video',
      originalName: file.name,
      size: file.size,
      sizeMo,
      storage: 'local',
    })
  } catch (error) {
    console.error('[API upload] error', error)
    const msg = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json(
      { error: `Upload échoué : ${msg}` },
      { status: 500 }
    )
  }
}
