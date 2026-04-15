import {Apiresponse} from "../utils/api-response.js"


const healthcheck = (req, res) =>{
    try{
        res
        .status(200)
        .json(new Apiresponse(200, "server is running"))
    }catch(err){

    }
}

export default healthcheck
