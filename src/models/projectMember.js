import mongoose, { Schema } from "mongoose";
import {AvailableTaskStatues, AvailableUserRole} from "../utils/constants.js"

const projectMemberSchema = mongoose.Schema(
    {
        user:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        Project:{
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        role:{
            type: String,
            enum: AvailableUserRole,
            default: AvailableUserRole.MEMBER
        }
    },
    {
        timestamps: true
    }
)

export const ProjectMember = mongoose.model("ProjectMember",projectMemberSchema);