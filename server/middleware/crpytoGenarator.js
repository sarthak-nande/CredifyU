import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const algorithm = 'aes-256-cbc'

// Use base64 or hex depending on what you put in your .env
const secretKey = process.env.SECRET_ENCRYPTION_KEY
if (!secretKey) {
  throw new Error('SECRET_ENCRYPTION_KEY not found in environment')
}

const keyBuffer = Buffer.from(secretKey, 'base64') // or 'hex'
if (keyBuffer.length !== 32) {
  throw new Error('SECRET_ENCRYPTION_KEY must be 32 bytes when decoded')
}

export const encryptText = (text) => {
  try {
    if (typeof text !== 'string') {
      throw new Error('Text to encrypt must be a string')
    }

    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv)
    let encrypted = cipher.update(text, 'utf-8', 'hex')
    encrypted += cipher.final('hex')

    return {
      iv: iv.toString('hex'),
      data: encrypted,
    }
  } catch (error) {
    console.error('Error occurred while encrypting text:', error)
    return null
  }
}

export const decryptText = (encryptedData, ivHex) => {
  try {
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv)
    let decrypted = decipher.update(encryptedData, 'hex', 'utf-8')
    decrypted += decipher.final('utf-8')
    return decrypted
  } catch (error) {
    console.error('Error occurred while decrypting text:', error)
    return null
  }
}
