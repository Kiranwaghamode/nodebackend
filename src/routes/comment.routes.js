import { Router } from "express";
import { addComment, deleteComment, getAllComments, updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.use(verifyJWT)

router.route("/add-comment/:videoId").post(addComment)
router.route("/delete-comment/:commentId").delete(deleteComment)
router.route("/update-comment/:commentId").post(updateComment)
router.route("/get-video-comments/:videoId").get(getAllComments)

// example video ID: 6664b08f9deeddab5b4f6fde


export default router;