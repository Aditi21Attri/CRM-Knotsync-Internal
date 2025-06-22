// Server-side only MongoDB wrapper
// This file should only be imported in API routes or server-side code

let _mongodb: any = null;

async function getMongoDB() {
  if (!_mongodb) {
    // Dynamic import to avoid client-side loading
    _mongodb = await import('mongodb');
  }
  return _mongodb;
}

let _client: any = null;
let _db: any = null;

export async function connectToDatabase() {
  if (typeof window !== 'undefined') {
    throw new Error('Database operations should only be used server-side');
  }

  if (_db) {
    return _db;
  }

  try {
    const mongodb = await getMongoDB();
    const { MongoClient } = mongodb;

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    _client = new MongoClient(process.env.MONGODB_URI);
    await _client.connect();
    
    const dbName = process.env.DB_NAME || 'CRM_koffee';
    _db = _client.db(dbName);
    
    console.log('✅ Connected to MongoDB database:', dbName);
    return _db;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function getObjectId() {
  const mongodb = await getMongoDB();
  return mongodb.ObjectId;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (_client) {
    await _client.close();
    console.log('🔌 MongoDB connection closed.');
  }
});

process.on('SIGTERM', async () => {
  if (_client) {
    await _client.close();
    console.log('🔌 MongoDB connection closed.');
  }
});
