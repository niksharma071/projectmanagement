import {Router} from "express";
const router = Router()
import healthcheck from "../conrollers/healthcheck_cont.js";


router.route("/").get(healthcheck)

export default router

