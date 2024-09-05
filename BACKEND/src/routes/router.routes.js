import {Router} from "express"
import { loginuser, logoutUser, registerUser,refreshAccessToeken } from "../controller/user.controller.js";
import {upload} from "../midleware/multer.middleware.js"
import  {verifyjwt}  from "../midleware/Auth.middlerware.js";

const router=Router();

router.route("/register").post(upload.fields([
    {name:"avatar",
    maxCount:1},
    {
        name:"coverImage",
        maxCount:1
    }
]),registerUser )

router.route("/login").post(loginuser)
// secure route
router.route("/logout").post(verifyjwt,logoutUser)
router.route("/refresh-token").post(refreshAccessToeken)

export default router;
  