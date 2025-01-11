import { generateNonce } from 'siwe'

export async function GET() {
  return Response.json({ nonce: generateNonce() })
} 