import { Router } from "express";
import { loginUser, logout, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
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
router.route("/logout").post(verifyJWT ,logout)

router.route("/refresh-token").post(refreshAccessToken)

export default router;