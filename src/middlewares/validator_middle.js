import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";
import { Apiresponse } from "../utils/api-response.js";


export const validateError = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) =>
    extractedErrors.push({
      [err.path]: err.msg,
    }),
  );
  return res
    .status(400)
    .json(new Apiresponse(422, "Recieved data is not valid", extractedErrors))
};