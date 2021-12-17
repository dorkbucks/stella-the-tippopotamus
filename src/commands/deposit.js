import dotenv from 'dotenv'
dotenv.config()

import QRCode from 'qrcode'

import { tokens } from '../tokens/index.js'


const tokenList = tokens.list('name', 'logo').reduce((str, { name, logo }) => {
  str = `${str}\n${logo.emoji} **${name}**`
  return str
}, '')
const pk = process.env.ACCOUNT_PUBLIC_KEY

export class DepositRequest {
  async call (sender) {
    const memo = sender._id
    const url = `web+stellar:pay?destination=${pk}&memo=${memo}`
    const qrCodeDataURI = await QRCode.toDataURL(url)
    const qrCodeBuffer = new Buffer.from(qrCodeDataURI.split(',')[1], 'base64')

    return {
      message: {
        heading: 'You may deposit any of these supported tokens:',
        body: `${tokenList}\n\nScan the qr code with your wallet or send to:\n **${pk}**\n with memo: \n **${memo}**`,
        image: { name: 'qrcode.png', attachment: qrCodeBuffer }
      }
    }
  }
}
