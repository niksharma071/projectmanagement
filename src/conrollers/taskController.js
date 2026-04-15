import { asynchandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { Apiresponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";
import { Project } from "../models/projectModel.js";
import { Task } from "../models/taskModel.js";
import { Subtask } from "../models/subTaskModel.js";
import mongoose, { Schema } from "mongoose";
import { ProjectMember } from "../models/projectMember.js";

const getAllTask = asynchandler(async (req, res) => {
    const { projectId } = req.params;
    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(400, "Invalid  ID format");
    }

    const alltasks = await Task.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedto",
                foreignField: "_id",
                as: "assignedToDetails",
            },
        },
        {
            $unwind: "$assignedToDetails",
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedby",
                foreignField: "_id",
                as: "assignedByDetails",
            },
        },
        {
            $unwind: "$assignedByDetails",
        },
        {
            $project: {
                title: 1,
                description: 1,
                assignedToDetails: {
                    username:1,
                    email: 1,
                },
                assignedByDetails: {
                    username: 1,
                    email: 1
                },
                _id: 0
            },
        }

    ]);

    return res
        .status(200)
        .json(new Apiresponse(200, alltasks, "all task fetched sucessfully"))
})
const createTask = asynchandler(async (req, res) => {
    const { title, description, email: useremail } = req.body;
    const { projectId } = req.params;
    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(400, "Invalid  ID format");
    }
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "project not found please provide valid id")
    }
    const user = await User.findOne({
        email: useremail
    })

    //console.log(user);


    if (!user) {
        throw new ApiError(400, "user not found with this email")
    }

    const checkMember = await ProjectMember.findOne({
        user: user._id,
        Project: projectId
    })

    if(!checkMember){
        throw new ApiError(400,"user is not available in project")
    }
    const task = await Task.create({
        title: title,
        description: description,
        project: new mongoose.Types.ObjectId(project._id),
        assignedto: new mongoose.Types.ObjectId(user._id),
        assignedby: new mongoose.Types.ObjectId(req.user._id),

    })

    return res
        .status(200)
        .json(new Apiresponse(200, task, "task created sucessfully"))
})

const getTaskById = asynchandler(async (req, res) => {
    const { taskId } = req.params;
    if (!mongoose.isValidObjectId(taskId)) {
        throw new ApiError(400, "Invalid  ID format");
    }
    const task = await Task.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedby",
                foreignField: "_id",
                as: "assignedByDetails",
            }
        },
        {
            $unwind: "$assignedByDetails"
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedto",
                foreignField: "_id",
                as: "assignedToDetails",
            }
        },
        {
            $unwind: "$assignedToDetails"
        },
        {
            $project: {
                title: 1,
                description: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                assignedByDetails: {
                    username: 1,
                    email: 1,

                },
                assignedToDetails: {
                    username: 1,
                    email: 1
                }
            },
        },

    ]);
    console.log(task)
    if (!task || task.length == 0) {
        throw new ApiError(400, "task not found")
    }
    return res
        .status(200)
        .json(new Apiresponse(200, task, "task found sucessfully"))

})

const updateTask = asynchandler(async (req, res) => {
    const { taskId } = req.params;
    const { title: newTitle, description: newDescription, status: newStatus } = req.body;
   if (!mongoose.isValidObjectId(taskId)) {
        throw new ApiError(400, "Invalid Project ID format");
    }


    const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        {
            status: newStatus,
            description: newDescription,
            title: newTitle
        },
        {
            new: true
        },

    )
    if (!updateTask) {
        throw new ApiError(400, "task not found")
    }

    return res
        .status(200)
        .json(new Apiresponse(200, updatedTask, "task uddatedsucessfully"))
})

const deleteTask = asynchandler(async (req, res) => {
    const { taskId } = req.params;
    if (!mongoose.isValidObjectId(taskId)) {
        throw new ApiError(400, "Invalid Project ID format");
    }
    await Subtask.deleteMany({task: taskId})
    const deletedtask = await Task.findByIdAndDelete(taskId)
    if (!deletedtask) {
        throw new ApiError(400, "task not found")
    }
    return res
        .status(200)
        .json(new Apiresponse(200, "task deleted sucessfully"))
})

const createSubTask = asynchandler(async (req, res) => {
    const userId = req.user._id;
    const { title } = req.body;
    const { taskId,projectId } = req.params;
    if (!mongoose.isValidObjectId(taskId)) {
        throw new ApiError(400, "Invalid ID format");
    }
    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(400, "Invalid ID format");
    }
    const subtask = await Subtask.create({
        title: title,
        project: projectId,
        task: new mongoose.Types.ObjectId(taskId),
        createdBy: new mongoose.Types.ObjectId(userId),
    })

    return res
        .status(200)
        .json(new Apiresponse(200, subtask, "subtask created sucessfully"))
})

const getAllSubTask = asynchandler(async (req, res) => {
    const { taskId } = req.params;
    if (!mongoose.isValidObjectId(taskId)) {
        throw new ApiError(400, "Invalid ID format");
    }
    //console.log("hii");

    const alltasks = await Subtask.aggregate([
        {
            $match: {
                task: new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "creadtedByDetails"
            }
        },
        {
            $unwind: "$creadtedByDetails"
        },
        {
            $project: {
                createdBy:{
                    username: 1,
                    email: 1
                },
                title: 1,
                isCompleted:1,
                _id: 0
            }
        }
    ])
    return res
        .status(200)
        .json(new Apiresponse(200, alltasks, "all task fetched sucessfully"))
})

const updateSubTask = asynchandler(async (req, res) => {
    const { subTaskId } = req.params;
    const { title, isCompleted } = req.body;
    if (!mongoose.isValidObjectId(subTaskId)) {
        throw new ApiError(400, "Invalid ID format");
    }
    const task = await Subtask.findByIdAndUpdate(
        subTaskId,
        {
            title: title,
            isCompleted: isCompleted
        },
        {
            new: true
        }
    )

    if (!task) {
        throw new ApiError(400, "subtask not found")
    }
    return res
        .status(200)
        .json(new Apiresponse(200, task, "subtask updated sucessfully"))
})

const deleteSubTask = asynchandler(async (req, res) => {
    const { subTaskId } = req.params;
    if (!mongoose.isValidObjectId(subTaskId)) {
        throw new ApiError(400, "Invalid ID format");
    }
    const deletedSubTask = await Subtask.findByIdAndDelete(subTaskId)
    console.log(deleteSubTask)
    if (!deletedSubTask) {
        throw new ApiError(400, "subtask not found")
    }
    return res
        .status(200)
        .json(new Apiresponse(200, "subTask deleted sucessfully"))
})

export { createTask, getAllTask, getTaskById, updateTask, deleteTask, createSubTask, getAllSubTask, updateSubTask, deleteSubTask }

