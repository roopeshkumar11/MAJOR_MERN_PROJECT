import {Router} from "express"
import { loginuser, logoutUser, registerUser,refreshAccessToeken, changeCurrentpassword, getcurrentuser, upadteAccountDetail, updateUseravatar, updateUsercoverImage, getUserChannelprofile, getwatchHistory } from "../controller/user.controller.js";
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
router.route("/change-password").post(verifyjwt,changeCurrentpassword)
router.route("/current-user").get(verifyjwt,getcurrentuser)
router.route("/update-account").patch(verifyjwt,upadteAccountDetail)
router.route("/avatar").patch(verifyjwt,upload.single("avatar"),updateUseravatar)
router.route("/cover-image").patch(verifyjwt,upload.single("coverImage"),updateUsercoverImage)
router.route("/c/:/username").get(verifyjwt,getUserChannelprofile)
router.route("/history").get(verifyjwt,getwatchHistory)
export default router;
  