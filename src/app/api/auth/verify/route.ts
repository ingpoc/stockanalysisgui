import { SiweMessage } from 'siwe'

export async function POST(request: Request) {
  try {
    const { message, signature } = await request.json()
    const siweMessage = new SiweMessage(message)
    
    const fields = await siweMessage.verify({
      signature,
      domain: process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).host : '',
      time: new Date().toISOString()
    })

    if (!fields.success) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Verification error:', error)
    return Response.json({ error: 'Verification failed' }, { status: 500 })
  }
} 