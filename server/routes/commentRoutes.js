import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import {
  getComments,
  createComment,
  replyToComment,
  updateComment,
  deleteComment,
  likeComment,
  dislikeComment,
  attachUserOptional,
} from '../controllers/commentController.js';

const router = Router();

const textRules = [body('text').trim().isLength({ min: 1, max: 5000 })];

router.get('/', attachUserOptional, getComments);
router.post('/', protect, textRules, createComment);
router.post('/:id/reply', protect, textRules, replyToComment);
router.put('/:id', protect, textRules, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, likeComment);
router.post('/:id/dislike', protect, dislikeComment);

export default router;
