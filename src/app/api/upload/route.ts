import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized, unauthorized } from '@/lib/admin-auth'
import { promises as fs } from 'fs'
import path from 'path'

const MAX_IMAGE = 15 * 1024 * 1024 // 15 Mo
const MAX_VIDEO = 100 * 1024 * 1024 // 100 Mo

const IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/jpg',
]
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg']

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized()
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Fichier manquant.' },
        { status: 400 },
      )
    }

    const type = file.type
    const isImage = IMAGE_TYPES.includes(type)
    const isVideo = VIDEO_TYPES.includes(type)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: `Type de fichier non supporté : ${type}` },
        { status: 400 },
      )
    }

    if (isImage && file.size > MAX_IMAGE) {
      return NextResponse.json(
        { error: 'Image trop volumineuse (max 15 Mo).' },
        { status: 400 },
      )
    }
    if (isVideo && file.size > MAX_VIDEO) {
      return NextResponse.json(
        { error: 'Vidéo trop volumineuse (max 100 Mo).' },
        { status: 400 },
      )
    }

    const dir = isImage ? 'articles' : 'videos'
    const targetDir = path.join(process.cwd(), 'public', dir)
    await fs.mkdir(targetDir, { recursive: true })

    const ext = path.extname(file.name) || (isImage ? '.png' : '.mp4')
    const base = `upl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const filename = `${base}${ext}`
    const filepath = path.join(targetDir, filename)

    const bytes = await file.arrayBuffer()
    await fs.writeFile(filepath, Buffer.from(bytes))

    const url = `/${dir}/${filename}`
    return NextResponse.json({
      success: true,
      url,
      filename,
      size: file.size,
      type,
    })
  } catch (err) {
    console.error('[api/upload POST]', err)
    return NextResponse.json(
      { error: 'Upload impossible.' },
      { status: 500 },
    )
  }
}
