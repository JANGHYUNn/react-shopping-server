import sweggerUi from 'swagger-ui-express';
import swaggerDocument from './api-spec.json';
import { Router } from 'express';

const router = Router();

router.use('/docs', sweggerUi.serve, sweggerUi.setup(swaggerDocument));
router.use('/api/v1', router);

export default router;
