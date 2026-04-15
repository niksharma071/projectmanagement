import { body } from "express-validator"
import { AvailableUserRole } from "../utils/constants.js";
console.log(AvailableUserRole)
const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("email should not be empty")
            .isEmail()
            .withMessage("email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("username should be provided")
            .isLowercase()
            .withMessage("username must be in the lower case")
            .isLength({ min: 3 })
            .withMessage("username should be of minimum 3 characters"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required"),

    ]
}

const userLoginValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("please provide email")
            .isEmail()
            .withMessage("please provide valid email"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("please provide password")


    ]
}

const createProjectValidator = () => {
    return [
        body("name")
            .notEmpty()
            .withMessage("please provide name of the project"),
        body("description").optional()
    ]
}

const updateProjectValidator = () => {
    return [
        body("name")
            .notEmpty()
            .withMessage("please provide name of the project"),
        body("description").optional()
    ]
}

const addMembertoProjectValidator = () => {
    console.log(AvailableUserRole);
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("please provide email")
            .isEmail()
            .withMessage("please provide valid email format"),
        body("role")
            .trim()
            .notEmpty()
            .withMessage("Role is required")
            .isIn(AvailableUserRole)
            .withMessage("Role is invalid"),
    ]
}

const updateMemberRoleValidator = () => {
    return[
    body("role")
        .notEmpty()
        .withMessage("Role is required")
        .isIn(AvailableUserRole)
        .withMessage("Role is invalid")
    ]
}

const createTaskValidator = ()=>{
    return[
        body("title")
            .notEmpty()
            .withMessage("title is required"),
        body("description")
            .notEmpty()
            .withMessage("description is required"),
        body("email")
            .notEmpty()
            .withMessage("email is required")
            .isEmail()
            .withMessage("please enter valid email")
    ]
}

const updatedTaskValidator = ()=>{
    return[
        body("title")
            .notEmpty()
            .withMessage("title is required"),
        body("description")
            .notEmpty()
            .withMessage("please provide description"),
        body("status")
            .notEmpty()
            .withMessage("please provide status"),
    ]
}

const createSubTaskValidator = ()=>{
    return[
        body("title")
            .notEmpty()
            .withMessage("please provide title")

    ]
}

const updateSubTaskValidator = ()=>{
    return[
        body("title")
            .notEmpty()
            .withMessage("please provide title")
            
    ]
}

const forgotPasswordValidator = ()=>{
    return[
        body("email")
            .trim()
            .notEmpty()
            .withMessage("please provide email")
            .isEmail()
            .withMessage("please provide valid email")
    ]
}

const passwordResetValidator = ()=>{
    return[
        body("password")
            .notEmpty()
            .withMessage("password field cannot be empty")
        
    ]
}
const passwordchangeValidator = ()=>{
    return[
        body("newpassword")
            .notEmpty()
            .withMessage("password field cannot be empty"),
        body("oldpassword")
            .notEmpty()
            .withMessage("old password field cannot be empty")
        
    ]
}


export {passwordchangeValidator, passwordResetValidator,userRegisterValidator, userLoginValidator, createProjectValidator, addMembertoProjectValidator, updateMemberRoleValidator, updateProjectValidator, createTaskValidator, updatedTaskValidator, createSubTaskValidator, updateSubTaskValidator,forgotPasswordValidator }