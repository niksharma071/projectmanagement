import { Router } from "express";
const router = Router();
import { verifyJWT, roleCheck } from "../middlewares/authuser_middle.js";
import { createTask, deleteTask, getAllSubTask, getAllTask, getTaskById, updateTask, createSubTask, updateSubTask, deleteSubTask } from "../conrollers/taskController.js";
import { UserRolesEnum, AvailableUserRole } from "../utils/constants.js";
import {createTaskValidator, updatedTaskValidator, createSubTaskValidator, updateSubTaskValidator} from "../validators/index.js"
import { validateError } from "../middlewares/validator_middle.js";

router.use(verifyJWT);

router.route("/:projectId")
    .post(roleCheck(UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN), createTaskValidator(), validateError,   createTask)
    .get(getAllTask)

router.route("/:projectId/:taskId")
    .get(  getTaskById)
    .put(roleCheck(UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN),updatedTaskValidator(), validateError, updateTask)
    .delete(roleCheck(UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN),    deleteTask)

router.route("/:projectId/:taskId/subtasks")
    .get(getAllSubTask)
    .post(roleCheck(UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN), createSubTaskValidator(), validateError, createSubTask)

router.route("/:projectId/:taskId/subtasks/:subTaskId")
    .put(roleCheck(UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN), updateSubTaskValidator(), validateError, updateSubTask)
    .delete( roleCheck(UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN), deleteSubTask)
export default router