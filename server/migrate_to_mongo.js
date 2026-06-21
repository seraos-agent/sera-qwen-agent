const fs = require('fs');
const { MongoClient } = require('mongodb');

async function migrate() {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('sera');

    const collections = ['stores', 'products', 'analytics', 'campaigns', 'system'];

    for (const coll of collections) {
      if (fs.existsSync(`db/${coll}.json`)) {
        try {
          const raw = fs.readFileSync(`db/${coll}.json`, 'utf8');
          const data = JSON.parse(raw || '[]');
          // For stores, filter out empty drafts
          const docs = coll === 'stores' ? data.filter(s => s.store_name) : data;

          if (docs.length > 0) {
            await db.collection(coll).deleteMany({});
            await db.collection(coll).insertMany(docs);
            console.log(`Migrated ${docs.length} documents to ${coll}`);
          }
        } catch (e) {
          console.error(`Error migrating ${coll}:`, e.message);
        }
      }
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
}

migrate();
