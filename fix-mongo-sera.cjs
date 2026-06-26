const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://qwen:Sera020294@cluster0.brtnzmp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

const OLD = 'http://127.0.0.1:8000';
const OLD2 = 'http://localhost:8000';
const NEW = 'https://ai.setaradapps.com';

function deepReplace(obj) {
  if (typeof obj === 'string') {
    return obj.replace(/http:\/\/(127\.0\.0\.1|localhost):8000/g, NEW);
  }
  if (Array.isArray(obj)) return obj.map(deepReplace);
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const key of Object.keys(obj)) {
      result[key] = deepReplace(obj[key]);
    }
    return result;
  }
  return obj;
}

async function fixDatabase(dbName) {
  const db = client.db(dbName);
  const collections = await db.listCollections().toArray();
  console.log(`\nDatabase: ${dbName} | Collections: ${collections.map(c => c.name).join(', ')}`);
  
  let totalFixed = 0;
  for (const col of collections) {
    const coll = db.collection(col.name);
    const docs = await coll.find({}).toArray();
    let fixed = 0;
    for (const doc of docs) {
      const fixedDoc = deepReplace(doc);
      if (JSON.stringify(fixedDoc) !== JSON.stringify(doc)) {
        const { _id, ...rest } = fixedDoc;
        await coll.updateOne({ _id: doc._id }, { $set: rest });
        fixed++;
      }
    }
    if (fixed > 0) {
      console.log(`  Fixed ${fixed} docs in ${col.name}`);
      totalFixed += fixed;
    }
  }
  return totalFixed;
}

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    // List all databases
    const adminDb = client.db('admin');
    const dbs = await adminDb.admin().listDatabases();
    console.log('Available databases:', dbs.databases.map(d => d.name));
    
    // Fix both possible database names
    for (const dbInfo of dbs.databases) {
      if (['sera', 'sera_commerce'].includes(dbInfo.name)) {
        const total = await fixDatabase(dbInfo.name);
        console.log(`Total fixed in ${dbInfo.name}: ${total}`);
      }
    }
    
    console.log('\nDone!');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.close();
  }
}

run();
