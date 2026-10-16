import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized, unauthorized } from '@/lib/admin-auth'
import ZAI from 'z-ai-web-dev-sdk'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized()
  try {
    const body = await req.json().catch(() => ({}))
    const prompt =
      (body.prompt || '').toString().trim() ||
      'Sports news illustration, dynamic photo, high quality'

    const zai = await ZAI.create()
    const response = await zai.images.generations.create({
      prompt,
      size: '1344x768',
    })

    const base64 = response?.data?.[0]?.base64
    if (!base64) {
      return NextResponse.json(
        { error: 'Génération sans résultat.' },
        { status: 500 },
      )
    }

    const dir = path.join(process.cwd(), 'public', 'articles')
    await fs.mkdir(dir, { recursive: true })
    const filename = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`
    const filepath = path.join(dir, filename)
    await fs.writeFile(filepath, Buffer.from(base64, 'base64'))

    return NextResponse.json({
      success: true,
      url: `/articles/${filename}`,
      filename,
    })
  } catch (err) {
    console.error('[api/generate-image POST]', err)
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Génération impossible.',
      },
      { status: 500 },
    )
  }
}
