import { Router } from "express";
const router = Router();
import { registerUser,loginUser, logout, currUser, changeCurrPassword, verifyEmail, resendVerificationMail, forgotpasswordrequest, passwordTokenVerification } from "../conrollers/authuser_cont.js";
import { validateError } from "../middlewares/validator_middle.js";
import {userRegisterValidator, userLoginValidator,forgotPasswordValidator, passwordchangeValidator, passwordResetValidator} from "../validators/index.js";
import { verifyJWT } from "../middlewares/authuser_middle.js";

router.route("/register").post(userRegisterValidator(),validateError,registerUser)

router.route("/login").post(userLoginValidator(), validateError, loginUser)
router.route("/verify-email/:verificationToken").get(verifyEmail)
router.route("/forgot-password").post(forgotPasswordValidator(), validateError,forgotpasswordrequest)
router.route("/reset-password/:resetToken").post(passwordResetValidator(),validateError,passwordTokenVerification)

router.route("/logout").post(verifyJWT, logout)
router.route("/current-user").get(verifyJWT, currUser)
router.route("/change-password").post(verifyJWT,passwordchangeValidator(), validateError, changeCurrPassword)
router.route("/resend-email-verification").post(verifyJWT, resendVerificationMail)
export default router