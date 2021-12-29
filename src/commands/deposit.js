import QRCode from 'qrcode'

import { walletAddress } from '../wallet/index.js'
import { tokens } from '../tokens/index.js'


const tokenList = tokens.list('name', 'logo').reduce((str, { name, logo }) => {
  str = `${str}\n${logo.emoji} **${name}**`
  return str
}, '')

export class DepositRequest {
  static channelTypes = ['DM']

  async call (sender) {
    const memo = sender._id
    const url = `web+stellar:pay?destination=${walletAddress}&memo=${memo}`
    const qrCodeDataURI = await QRCode.toDataURL(url)
    const qrCodeBuffer = new Buffer.from(qrCodeDataURI.split(',')[1], 'base64')

    return {
      messages: [{
        heading: 'You may deposit any of these supported tokens:',
        body: `${tokenList}\n\nScan the qr code with your wallet or send to:\n **${walletAddress}**\n with memo: \n **${memo}**`,
        image: { name: 'qrcode.png', attachment: qrCodeBuffer }
      }]
    }
  }
}
