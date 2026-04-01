import { Router } from 'express';
import { upload } from '../middleware/upload';
import {
  uploadImage,
  getJobStatus,
  removeBackground,
  applyStyle,
  enhanceFace,
  replaceBackground,
  getResult,
  deleteJobHandler,
  healthCheck,
} from '../controllers/jobController';

const router = Router();

router.post('/upload', upload.single('image'), uploadImage);
router.get('/status/:jobId', getJobStatus);
router.post('/remove-bg/:jobId', removeBackground);
router.post('/apply-style/:jobId', applyStyle);
router.post('/enhance/:jobId', enhanceFace);
router.post('/replace-bg/:jobId', replaceBackground);
router.get('/result/:jobId', getResult);
router.delete('/job/:jobId', deleteJobHandler);
router.get('/health', healthCheck);

export default router;
