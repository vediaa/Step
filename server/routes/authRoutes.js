import express from "express";
import {
  kayitOl,
  girisYap,
  cikisYap,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router(); //routerlardan önce çalışmalı

router.post("/kayit", kayitOl);
router.post("/giris", girisYap);
router.get("/cikis", cikisYap);
router.get("/send-verify-otp", userAuth, sendVerifyOtp);
router.post("/verify-account", userAuth, verifyEmail);
router.post("/is-auth", userAuth, isAuthenticated);
router.post("/send-reset-OTP", sendResetOtp);
router.post("/send-password", resetPassword);

export default router;
