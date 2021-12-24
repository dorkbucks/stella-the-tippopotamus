export async function getActiveUsers (collection, serverID, lastNMinutes=30, limit=30) {
  const query = {
    [`activity.${serverID}.lastActive`]: {
      $gte: new Date(Date.now() - lastNMinutes * 60000)
    }
  }

  return await collection.find(query).sort({ lastActive: -1 }).limit(limit).toArray()
}
