import { NextRequest, NextResponse } from 'next/server'
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
    const buffer = Buffer.from(arrayBuffer)
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
        console.error('[upload] Cloudinary erreur:', cloudinaryError)
        return NextResponse.json(
          { error: 'Upload Cloudinary échoué. Vérifiez la configuration Cloudinary.' },
          { status: 500 }
        )
      }
    }

    // Pas de fallback local en production (Vercel = read-only filesystem)
    return NextResponse.json(
      { error: 'Cloudinary non configuré. Ajoutez CLOUDINARY_* dans les variables Vercel.' },
      { status: 500 }
    )
  } catch (error) {
    console.error('[API upload] error', error)
    return NextResponse.json(
      { error: `Upload échoué : ${error instanceof Error ? error.message : 'erreur'}` },
      { status: 500 }
    )
  }
}
