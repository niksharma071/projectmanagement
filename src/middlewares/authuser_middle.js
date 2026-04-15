import { User } from "../models/user.models.js";
import { ProjectMember } from "../models/projectMember.js";
import { ApiError } from "../utils/api-error.js";
import { asynchandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


export const verifyJWT = asynchandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
        );

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }
        req.user = user;
        next();
    }
    catch (error) {
        throw new ApiError(401, "Invalid access token");
    }
})


export const roleCheck = (roles = []) => {
    return asynchandler(async (req, res, next) => {
        const { projectId } = req.params;
        if (!mongoose.isValidObjectId(projectId)) {
            throw new ApiError(400, "Invalid ID format");
        }
        const project = await ProjectMember.findOne({
            Project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(req.user._id),
        });
        if (!project) {
            throw new ApiError(400, "project not found this")
        }
        if (!roles.includes(project.role)) {
            throw new ApiError(400, "you don't have permission to do this task")
        }
        next()
    })
}