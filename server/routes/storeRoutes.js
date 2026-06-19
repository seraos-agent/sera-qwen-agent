import express from 'express';
import { publishStore, deleteStore, searchProducts, getAnalytics, getStores, getProducts } from '../controllers/storeController.js';
import { createCampaigns, activateCampaign } from '../controllers/campaignController.js';
import { createGuestSession } from '../controllers/guestController.js';

const router = express.Router();

router.post('/api/publish', publishStore);
router.delete('/api/stores/:store_id', deleteStore);
router.post('/api/search-products', searchProducts);
router.get('/api/analytics', getAnalytics);
router.get('/api/stores', getStores);
router.get('/api/products', getProducts);
router.post('/api/campaigns', createCampaigns);
router.patch('/api/campaigns/activate', activateCampaign);
router.post('/api/guest/session', createGuestSession);

export default router;
