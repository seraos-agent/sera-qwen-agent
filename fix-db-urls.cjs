const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://qwen:Sera020294@cluster0.brtnzmp.mongodb.net/sera_commerce?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('sera_commerce');
    
    // Fix Stores
    const stores = await db.collection('stores').find({}).toArray();
    let storesUpdated = 0;
    for (const store of stores) {
      let updated = false;
      
      const replaceUrl = (url) => {
        if (!url) return url;
        if (url.includes('localhost:8000') || url.includes('127.0.0.1:8000') || url.includes('http://127.0.0.1')) {
          updated = true;
          return url.replace(/http:\/\/(localhost|127\.0\.0\.1):8000/g, 'https://ai.setaradapps.com');
        }
        return url;
      };

      if (store.heroImage) store.heroImage = replaceUrl(store.heroImage);
      if (store.logo) store.logo = replaceUrl(store.logo);
      if (store.assets) store.assets = store.assets.map(replaceUrl);
      if (store.campaignVideo) store.campaignVideo = replaceUrl(store.campaignVideo);
      
      if (updated) {
        await db.collection('stores').updateOne({ _id: store._id }, { $set: store });
        storesUpdated++;
      }
    }
    
    // Fix Products
    const products = await db.collection('products').find({}).toArray();
    let productsUpdated = 0;
    for (const product of products) {
      let updated = false;
      const replaceUrl = (url) => {
        if (!url) return url;
        if (url.includes('localhost:8000') || url.includes('127.0.0.1:8000') || url.includes('http://127.0.0.1')) {
          updated = true;
          return url.replace(/http:\/\/(localhost|127\.0\.0\.1):8000/g, 'https://ai.setaradapps.com');
        }
        return url;
      };

      if (product.image) product.image = replaceUrl(product.image);
      if (product.video) product.video = replaceUrl(product.video);
      if (product.images) product.images = product.images.map(replaceUrl);
      
      if (updated) {
        await db.collection('products').updateOne({ _id: product._id }, { $set: product });
        productsUpdated++;
      }
    }

    console.log(`Successfully updated ${storesUpdated} stores and ${productsUpdated} products to use HTTPS URL.`);
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
run();
