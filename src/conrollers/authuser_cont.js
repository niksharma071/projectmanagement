import { Apiresponse } from "../utils/api-response.js";
import {ApiError} from "../utils/api-error.js";
import { User } from "../models/user.models.js";
import { asynchandler } from "../utils/async-handler.js";
import { sendEmail, forgotpasswordcontent, emailverificationcontent } from "../utils/mail.js";
import { json } from "express";
import crypto from "crypto"


const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token",
    );
  }
};

const registerUser = asynchandler(async (req, res) => {
    const {username, email, password} = req.body;
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(404,"user already registerd with same user id or email")
    }

    const user = await User.create({
        username,
        email,
        password,
        isEmailVerified: false
    })

    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false})

    await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailverificationcontent(
          user.username,
          `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
        ),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );
    
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering a user");
    }

    return res
        .status(201)
        .json(
          new Apiresponse(
            200,
            { user: createdUser },
            "User registered successfully and verification email has been sent on your email",
          ),
        );
    

})

const loginUser = asynchandler( async (req,res) =>{
    const {email,password} = req.body

    let user = await User.findOne({email})
    if(!user){
        throw new ApiError(404,"user not registered")
    }

    const passCheck = await user.isPasswordCorrect(password)
    if(!passCheck){
        throw new ApiError(404,"password is incorrect")
    }
    
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id,)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    const options = {
    httpOnly: true,
    secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new Apiresponse(
            200,
            {
              user: loggedInUser,
              accessToken,
            },
            "User logged in successfully",
            ),
        );


})

const logout = asynchandler(async(req, res, next)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: ""
      }
    },
    {
      new: true
    }
  )
  const options =  {
      httpOnly: true,
      secure: true
  }
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new Apiresponse(200, {}, "User logged out"));
} )

const currUser = asynchandler(async (req, res, next)=>{
  const Id = req.user._id;
  const user = await User.findById(Id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  return res
      .status(200)
      .json(new Apiresponse(200, user, "Current user fetched successfully"));

})

const changeCurrPassword = asynchandler(async (req, res, next)=>{
  const {oldpassword,newpassword} = req.body;
  if(!oldpassword || !newpassword){
    throw new ApiError(404,"please provide all fields")
  }
  
  const user = await User.findById(req.user?._id)
  const passCheck = await user.isPasswordCorrect(oldpassword)
  if(!passCheck){
    throw new ApiError(404,"please enter correct old password")
  }

  user.password = newpassword
  await user.save({ validateBeforeSave: false })

  res
    .status(200)
    .json(new Apiresponse(200,"password change sucessfully"))

})

const verifyEmail = asynchandler(async (req, res)=>{
  const {verificationToken} = req.params;
  if(!verificationToken){
    throw new ApiError(404,"plaese provide verification url")
  }

  const hashedToken_verfication = crypto
          .createHash("sha256")
          .update(verificationToken)
          .digest("hex")

  const user = await User.findOne({
    emailVerificationToken: hashedToken_verfication
  })
  


  if(!user){
    throw new ApiError(404,"invalid verification token")
  }
  if(user.emailVerificationExpiry < Date.now()){
    throw new ApiError(404,"please send new verification mail this token is expired")
  };

  user.isEmailVerified = true
  await user.save({validateBeforeSave:false})



  res
    .status(200)
    .json(new Apiresponse(200,"email verified sucessfully"))

})

const resendVerificationMail = asynchandler(async (req,res)=>{
  const user = req?.user;
  if(!user){
    throw new ApiError(400,"user find problem")
  }
  const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

  await user.save({validateBeforeSave:false})
  await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailverificationcontent(
          user.username,
          `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
        ),
  });
  
  res
    .status(200)
    .json(new Apiresponse(200,"verification mail send sucessfully"))
})

const forgotpasswordrequest = asynchandler(async(req,res)=>{
  const {email} = req.body;

  // console.log(email)
  const user = await User.findOne({
    email: email
  })

  if(!user){
    throw new ApiError(400,"user not exist")
  }

  const {unHashedToken, hashedToken, tokenExpiry} =  user.generateTemporaryToken()
   
  user.forgotPasswordToken = hashedToken
  user.forgotPasswordExpiry = tokenExpiry
  await user.save({validateBeforeSave: false})
  await sendEmail({
        email: user?.email,
        subject: "password reset",
        mailgenContent: forgotpasswordcontent(
          user.username,
          `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${unHashedToken}`,
        ),
  });

  res
    .status(200)
    .json(new Apiresponse(200,"password reset mail send sucessfully"))
})

const passwordTokenVerification = asynchandler(async(req,res)=>{
  const {password} = req.body;
  const {resetToken} = req.params;
  
  if(!resetToken){
    throw new ApiError(400,"please provide valid token")
  }
  
  const hashedToken = crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex")

  const user = await User.findOne({
    forgotPasswordToken: hashedToken
  })      
  
  if(!user){
    throw new ApiError(400,"invalid token provided")
  }

  if(Date.now > user.forgotPasswordExpiry){
    throw new ApiError(400,"please resend password reset mail as this verfication url is expired")
  }

  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;
  
  user.password = password

  await user.save({validateBeforeSave: false})

  return res
          .status(200)
          .json(new Apiresponse(200,"password reset sucessfully"))


})

export {registerUser,loginUser,logout, currUser, changeCurrPassword, verifyEmail, resendVerificationMail, forgotpasswordrequest,passwordTokenVerification}