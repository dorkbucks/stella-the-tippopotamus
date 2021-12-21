import dotenv from 'dotenv'
dotenv.config()

import { MongoClient } from 'mongodb'


const {
  MONGODB_USER,
  MONGODB_PASSWORD,
  MONGODB_HOST,
  MONGODB_PORT,
  MONGODB_DATABASE
} = process.env

const url = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}?authSource=admin`
const client = new MongoClient(url)
let _client

export async function connect () {
  _client = _client || await client.connect()
  return _client
}

export async function getCollection (name) {
  await connect()
  return _client.db().collection(name)
}
