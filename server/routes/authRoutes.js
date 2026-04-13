import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController.js';

const router = Router();

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 2, max: 32 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  register
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  login
);

export default router;
