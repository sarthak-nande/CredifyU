import express from 'express';
import {
  SignUp,
  CompleteSignup,
  LogIn,
  GetUser,
  RefreshAccessToken,
  SaveUserDetails,
  CollegeNames,
  SendOTP,
  VerifyOTP,
  SendQRCode,
  SendBulkQRCodes
} from '../controller/UserController.js';

const router = express.Router();

router.post('/signup', SignUp);

router.post('/complete-signup', CompleteSignup);

router.post('/login', LogIn);

router.post('/get-user', GetUser);

router.post('/refresh-token', RefreshAccessToken);

router.post('/save-user-details', SaveUserDetails);

router.post('/logout', (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  };
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
  return res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/college-names', CollegeNames);

router.post('/send-otp', SendOTP);

router.post('/verify-otp', VerifyOTP);

router.post('/send-qr-code', SendQRCode);

router.post('/send-bulk-qr-codes', SendBulkQRCodes);

export default router;
