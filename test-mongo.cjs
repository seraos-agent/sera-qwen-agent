const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://qwen:Sera020294@cluster0.brtnzmp.mongodb.net/sera_commerce?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('sera_commerce');
    const store = await db.collection('stores').findOne({}, { sort: { _id: -1 } });
    console.log(JSON.stringify(store, null, 2));
  } finally {
    await client.close();
  }
}
run();
