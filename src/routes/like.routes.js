import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos, isTweetLiked, isVideoLiked, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";


const router = Router()

router.use(verifyJWT)

router.route("/toggle-video-like/:videoId").patch(toggleVideoLike)
router.route("/toggle-comment-like/:commentId").patch(toggleCommentLike)
router.route("/get-liked-videos").get(getLikedVideos)
router.route("/is-video-liked/:videoId").get(isVideoLiked)
router.route("/is-tweet-liked/:tweetId").get(isTweetLiked)
router.route('/toggle-tweet-like/:tweetId').patch(toggleTweetLike)


export default router

// 666b8145cae60fb5f7afa547
