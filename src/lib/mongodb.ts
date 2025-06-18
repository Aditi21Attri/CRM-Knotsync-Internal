
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}
if (!dbName) {
  throw new Error('Please define the DB_NAME environment variable inside .env');
}

let client: MongoClient;
let dbInstance: Db; // Renamed to avoid conflict with global 'db' type if any

// Use a global variable to preserve the client across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

async function connectToDatabase(): Promise<Db> {
  if (dbInstance) {
    return dbInstance;
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    client = await global._mongoClientPromise;
  } else {
    client = new MongoClient(uri);
    await client.connect();
  }
  
  dbInstance = client.db(dbName);
  return dbInstance;
}

export { connectToDatabase };
