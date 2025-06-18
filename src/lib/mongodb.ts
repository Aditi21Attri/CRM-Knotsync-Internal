
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
let db: Db;

// Use a global variable to preserve the client across hot reloads in development
// See: https://github.com/vercel/next.js/pull/17666
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
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
  
  db = client.db(dbName);
  return db;
}

export { connectToDatabase };
