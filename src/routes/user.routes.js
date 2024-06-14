import { Router } from "express";
import {  changeCurrentPassword,
          getCurrentUser,
          getUserChannelProfile, 
          getWatchHistory, loginUser, 
          logout, refreshAccessToken, 
          registerUser, 
          updateAccountDetails, 
          updateUserAvatar, 
          updateUserCoverImage 
        } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()





// router.get("/register", user);
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

//route for login
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT ,logout) //done
router.route("/refresh-token").post(refreshAccessToken) //done
router.route("/change-password").post(verifyJWT, changeCurrentPassword) //done
router.route("/current-user").get(verifyJWT, getCurrentUser) //done
router.route("/update-account").patch(verifyJWT, updateAccountDetails) //done
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar) //done
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage) //done
router.route("/c/:username").get(verifyJWT, getUserChannelProfile) //done
router.route("/history").get(verifyJWT, getWatchHistory) //done



export default router;