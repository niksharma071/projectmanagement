import { Project } from "../models/projectModel.js";
import { ProjectMember } from "../models/projectMember.js";
import { User } from "../models/user.models.js";
import { Apiresponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js";
import { asynchandler } from "../utils/async-handler.js"
import { UserRolesEnum } from "../utils/constants.js";
import mongoose from "mongoose";
import req from "express/lib/request.js";
import { Task } from "../models/taskModel.js";
import { Subtask } from "../models/subTaskModel.js";


const createProject = asynchandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(400, "please provide all fields")
    }

    const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id)
    })

    await ProjectMember.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        Project: new mongoose.Types.ObjectId(project._id),
        role: UserRolesEnum.ADMIN,
    });

    return res
        .status(200)
        .json(new Apiresponse(200, project, "project created sucessfully"))
})

const updateProject = asynchandler(async (req, res) => {
    const { name: newName, description: newDescription } = req.body;
    const { projectId } = req.params;
    if (!newName || !newDescription) {
        throw new ApiError(400, "please provide all fields")
    }
    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(400, "Invalid ID format");
    }
    const project = await Project.findById(new mongoose.Types.ObjectId(projectId))
    if (!project) {
        throw new ApiError(400, "project not found")
    }

    project.name = newName;
    project.description = newDescription;

    await project.save({ validateBeforeSave: false })
    return res
        .status(200)
        .json(new Apiresponse(200, "project updated sucessfully"))
})

const deleteProject = asynchandler(async (req, res) => {
    const { projectId } = req.params;
    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(400, "Invalid  ID format");
    }
    await ProjectMember.deleteMany({ Project: projectId });
    await Task.deleteMany({ project: projectId });
    await Subtask.deleteMany({ project: projectId });
    


    const project = await Project.findByIdAndDelete(projectId)
    if (!project) {
        throw new ApiError(200, "please provide valid project id")
    }

    return res
        .status(200)
        .json(new Apiresponse(200, "project deleted sucessfully"))
})

const getProjects = asynchandler(async (req, res) => {
    const projects = await ProjectMember.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "projects",
                localField: "Project",
                foreignField: "_id",
                as: "projects",
            },
        },
        {
            $unwind: "$projects",
        },
        {
            $project: {
                projects: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    members: 1,
                    createdAt: 1,
                    createdBy: 1,
                },
                role: 1,
                _id: 0,
            },
        },
    ]);

    return res
        .status(200)
        .json(new Apiresponse(200, projects, "project fetched sucessfully"))
})


const getProjectById = asynchandler(async (req, res) => {
    const { projectId } = req.params;
    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(400, "Invalid Project ID format");
    }
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res
        .status(200)
        .json(new Apiresponse(200, project, "Project fetched successfully"));
});

const getallmembers = asynchandler(async (req, res) => {
    const { projectId } = req.params;
    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(400, "Invalid Project ID format");
    }
    console.log(projectId)
    const allmembers = await ProjectMember.aggregate([
        {
            $match: {
                Project: new mongoose.Types.ObjectId(projectId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "users",
            },
        },
        {
            $unwind: "$users",
        },
        {
            $project: {
                users: {
                    username: 1,
                    email: 1,
                },
                role: 1,
                _id: 0,
            }
        },
    ])
    return res
        .status(200)
        .json(new Apiresponse(200, allmembers, "all members fetched sucessfully"))
})

const addMembersToProject = asynchandler(async (req, res) => {
    const { email, role } = req.body;
    const { projectId } = req.params;

    if (!email || !role) {
        throw new ApiError(400, "please provide all feilds")
    }
    if (!projectId) {
        throw new ApiError(400, "please provide project id")
    }

    const user = await User.findOne({
        email: email
    });
    if (!user) {
        throw new ApiError(200, "user not registered with this mail")
    }

    const project = await Project.findById(projectId)

    if (!project) {
        throw new ApiError(400, "please enter valid project id")
    }

    const checkMember = await ProjectMember.findOne({
        user: new mongoose.Types.ObjectId(user.id),
        Project: new mongoose.Types.ObjectId(projectId)
    })

    if (checkMember) {
        throw new ApiError(400, "member already exists in project")
    }

    const projectMember = await ProjectMember.create({
        user: new mongoose.Types.ObjectId(user._id),
        Project: new mongoose.Types.ObjectId(projectId),
        role: role
    }
    )

    if (!projectMember) {
        throw new ApiError(400, "encountered an error while adding projectmember")
    }
    return res
        .status(200)
        .json(new Apiresponse(200, projectMember, "member added sucessfully"))
})

const updateMemberRole = asynchandler(async (req, res) => {
    const { role: newRole } = req.body;
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid Project ID format");
    }
    
    //console.log(userId);

    let member = await ProjectMember.findOne({
        user: new mongoose.Types.ObjectId(userId)
    })
    if (!member) {
        throw new ApiError(200, "can't able to find member provide valid id")
    }

    member.role = newRole;
    await member.save({ validateBeforeSave: false })
    return res
        .status(200)
        .json(new Apiresponse(200, member, "updated sucessfully"))
})

const deleteMember = asynchandler(async (req, res) => {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid  ID format");
    }
    const member = await ProjectMember.findOneAndDelete({
        user: userId
    })
    
    if (!member) {
        throw new ApiError(400, "member not found")
    }

    return res
        .status(200)
        .json(new Apiresponse(200, "member deleted sucessfully"))
})
export { createProject, updateProject, deleteProject, getProjects, getProjectById, addMembersToProject, updateMemberRole, deleteMember, getallmembers }