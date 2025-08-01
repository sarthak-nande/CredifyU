import { generateKeyPairSync } from 'crypto'


async function generateKeys() {
    try {
        const { publicKey, privateKey } = generateKeyPairSync('ec', {
            namedCurve: 'P-256', 
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        })

        return {publicKey, privateKey}
        
    } catch (error) {
        console.error('Error generating keys:', error)
    }
}

export { generateKeys }