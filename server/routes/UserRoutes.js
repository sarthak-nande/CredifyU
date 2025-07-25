import express from 'express';
import {
  SignUp,
  LogIn,
  GetUser,
  refreshAccessToken
} from '../controller/UserController.js';

const router = express.Router();

router.post('/signup', SignUp);

router.post('/login', LogIn);

router.post('/get-user', GetUser);

router.post('/refresh-token', refreshAccessToken);

router.post('/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
