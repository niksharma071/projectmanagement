import mongoose, { Schema, trusted } from "mongoose";
import { AvailableTaskStatues, TaskStatusEnum } from "../utils/constants.js";


const TaskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    assignedto: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignedby: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: AvailableTaskStatues,
        default: TaskStatusEnum.TODO
    },
    attachments: {
        type: [
            {
                url: String,
                mimetype: String,
                size: Number,
            },
        ],
        default: [],

    },
},{timestamps: true})

export const Task = mongoose.model("Task", TaskSchema);