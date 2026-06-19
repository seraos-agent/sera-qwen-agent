import fs from 'fs';

const content = fs.readFileSync('server/routes/storeRoutes.js.bak', 'utf8');

fs.mkdirSync('server/controllers', {recursive:true});
fs.mkdirSync('server/services', {recursive:true});

// Extract block helper
function extractBlock(startString, endString) {
    const start = content.indexOf(startString);
    if (start === -1) return '';
    let end = content.length;
    if (endString) {
        end = content.indexOf(endString, start);
        if (end === -1) end = content.length;
    }
    return content.substring(start, end);
}

const imports = "import { callFlexibleMcpTool, getMcpClient } from '../services/mcpService.js';\nimport { uploadToGcs } from '../routes/assetRoutes.js';\n\n";
const helpers = extractBlock("function addGuestSessionFields", "// 4. API Endpoint: POST /api/publish");

// Extract controllers
const publishStore = extractBlock("router.post('/api/publish', async (req, res) => {", "// 5. API Endpoint: DELETE /api/stores/:store_id")
    .replace("router.post('/api/publish', async (req, res) => {", "export const publishStore = async (req, res) => {")
    .replace(/}\);\n*$/, "};\n");

const deleteStore = extractBlock("router.delete('/api/stores/:store_id', async (req, res) => {", "router.post('/api/search-products', async (req, res) => {")
    .replace("router.delete('/api/stores/:store_id', async (req, res) => {", "export const deleteStore = async (req, res) => {")
    .replace(/}\);\n*$/, "};\n");

const searchProducts = extractBlock("router.post('/api/search-products', async (req, res) => {", "// 5. API Endpoint: GET /api/analytics")
    .replace("router.post('/api/search-products', async (req, res) => {", "export const searchProducts = async (req, res) => {")
    .replace(/}\);\n*$/, "};\n");

const getAnalytics = extractBlock("router.get('/api/analytics', async (req, res) => {", "// API Endpoint: DELETE /api/stores/:id")
    .replace("router.get('/api/analytics', async (req, res) => {", "export const getAnalytics = async (req, res) => {")
    .replace(/}\);\n*$/, "};\n");

const getStores = extractBlock("router.get('/api/stores', async (req, res) => {", "// 6b. API Endpoint: GET /api/products")
    .replace("router.get('/api/stores', async (req, res) => {", "export const getStores = async (req, res) => {")
    .replace(/}\);\n*$/, "};\n");

const getProducts = extractBlock("router.get('/api/products', async (req, res) => {", "// 7. API Endpoint: POST /api/campaigns")
    .replace("router.get('/api/products', async (req, res) => {", "export const getProducts = async (req, res) => {")
    .replace(/}\);\n*$/, "};\n");

const campaigns = extractBlock("router.post('/api/campaigns', async (req, res) => {", "// 8. API Endpoint: PATCH /api/campaigns/activate")
    .replace("router.post('/api/campaigns', async (req, res) => {", "export const createCampaigns = async (req, res) => {")
    .replace(/}\);\n*$/, "};\n");

const activateCampaign = extractBlock("router.patch('/api/campaigns/activate', async (req, res) => {", "// 9. Auto-Cleanup Guest Data")
    .replace("router.patch('/api/campaigns/activate', async (req, res) => {", "export const activateCampaign = async (req, res) => {")
    .replace(/}\);\n*$/, "};\n");

const guestSession = extractBlock("router.post('/api/guest/session', (req, res) => {", "export default router;")
    .replace("router.post('/api/guest/session', (req, res) => {", "export const createGuestSession = (req, res) => {")
    .replace(/}\);\n*$/, "};\n");

const cleanup = extractBlock("async function cleanupExpiredGuests() {", "// 10. API Endpoint: POST /api/guest/session")
    .replace("async function cleanupExpiredGuests() {", "export async function cleanupExpiredGuests() {");

// Write Store Controller
fs.writeFileSync('server/controllers/storeController.js', imports + helpers + publishStore + deleteStore + searchProducts + getAnalytics + getStores + getProducts);

// Write Campaign Controller
fs.writeFileSync('server/controllers/campaignController.js', imports + helpers + campaigns + activateCampaign);

// Write Guest Controller
fs.writeFileSync('server/controllers/guestController.js', guestSession);

// Write Cleanup Service
fs.writeFileSync('server/services/cleanupService.js', "import { callFlexibleMcpTool, getMcpClient } from './mcpService.js';\n\n" + cleanup);

// Rewrite storeRoutes.js
const newRoutes = `import express from 'express';
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
`;
fs.writeFileSync('server/routes/storeRoutes.js', newRoutes);

console.log("Refactoring complete!");
