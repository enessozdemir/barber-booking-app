import { Router } from 'express';
import { updatePosAmount, getDailyStats } from './daily-stats.controller';
import { verifyToken } from '../../auth/middleware/verifyToken';

const router = Router();

router.use(verifyToken);

router.post('/pos', updatePosAmount);
router.get('/:date', getDailyStats);

export default router;
