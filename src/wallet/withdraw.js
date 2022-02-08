import { URL } from 'url'
import { Worker } from 'worker_threads'

import { Queue } from '../lib/queue.js'


const queue = new Queue()
const workerFile = new URL('./withdraw_worker.js', import.meta.url)

export function withdraw(account, { amount, token, address, memo }) {
  return queue.add(() => new Promise((resolve, reject) => {
    const worker = new Worker(workerFile, {
      workerData: { account, amount, token, address, memo }
    })
    worker.on('message', resolve)
    worker.on('error', reject)
  }))
}
