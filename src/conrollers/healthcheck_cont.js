import {Apiresponse} from "../utils/api-response.js"


const healthcheck = (req, res) =>{
    try{
        res
        .status(200)
        .json(new Apiresponse(200, "server is running after the ci/cd pipeline with docker checking again"))
    }catch(err){

    }
}

export default healthcheck
