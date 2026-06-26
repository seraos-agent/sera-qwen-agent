const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://qwen:Sera020294@cluster0.brtnzmp.mongodb.net/sera_commerce?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

const OLD = 'http://127.0.0.1:8000';
const NEW = 'https://ai.setaradapps.com';

function deepReplaceUrl(obj) {
  if (typeof obj === 'string') {
    return obj.includes(OLD) ? obj.replace(new RegExp(OLD.replace(/\./g, '\\.'), 'g'), NEW) : obj;
  }
  if (Array.isArray(obj)) return obj.map(deepReplaceUrl);
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const key of Object.keys(obj)) {
      result[key] = deepReplaceUrl(obj[key]);
    }
    return result;
  }
  return obj;
}

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    const db = client.db('sera_commerce');

    // Fix Stores
    const stores = await db.collection('stores').find({}).toArray();
    let storesFixed = 0;
    for (const store of stores) {
      const fixed = deepReplaceUrl(store);
      // Check if anything changed
      if (JSON.stringify(fixed) !== JSON.stringify(store)) {
        const { _id, ...rest } = fixed;
        await db.collection('stores').updateOne({ _id: store._id }, { $set: rest });
        console.log('Fixed store:', store.store_name || store._id);
        storesFixed++;
      }
    }

    // Fix Products
    const products = await db.collection('products').find({}).toArray();
    let productsFixed = 0;
    for (const product of products) {
      const fixed = deepReplaceUrl(product);
      if (JSON.stringify(fixed) !== JSON.stringify(product)) {
        const { _id, ...rest } = fixed;
        await db.collection('products').updateOne({ _id: product._id }, { $set: rest });
        productsFixed++;
      }
    }

    console.log(`\nDone! Fixed ${storesFixed} stores and ${productsFixed} products in MongoDB Atlas.`);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.close();
  }
}

run();
