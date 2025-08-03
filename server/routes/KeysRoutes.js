import express from 'express';
import { GetPublicKey } from '../controller/KeysController.js';

const router = express.Router();

router.post('/get-publickey', GetPublicKey);

export default router;