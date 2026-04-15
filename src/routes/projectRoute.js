import { Router } from "express";
const router = Router()
import { createProject, updateProject, deleteProject, getProjects, getProjectById, addMembersToProject, updateMemberRole, deleteMember, getallmembers } from "../conrollers/projectContrroler.js";
import { verifyJWT } from "../middlewares/authuser_middle.js";
import { roleCheck } from "../middlewares/authuser_middle.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import {addMembertoProjectValidator, updateMemberRoleValidator, updateProjectValidator, createProjectValidator  } from "../validators/index.js";
import {validateError} from "../middlewares/validator_middle.js";
router.use(verifyJWT)
router.route("/")
    .post(createProjectValidator(),validateError  , createProject)
    .get(getProjects)
router.route("/:projectId")
    .put(roleCheck([UserRolesEnum.PROJECT_ADMIN,UserRolesEnum.ADMIN]),updateProjectValidator(),validateError, updateProject)
    .delete(roleCheck([UserRolesEnum.ADMIN]), deleteProject)
    .get(getProjectById)

router.route("/:projectId/members")
    .get(getallmembers)
    .post(roleCheck([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),addMembertoProjectValidator(),validateError, addMembersToProject)

router.route("/:projectId/members/:userId")
    .post(roleCheck([UserRolesEnum.ADMIN]),updateMemberRoleValidator(),validateError, updateMemberRole)
    .delete(roleCheck([UserRolesEnum.ADMIN]),deleteMember)    
export default router;