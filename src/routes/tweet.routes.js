import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";


const router = Router()

router.use(verifyJWT)

router.route('/create-tweet').post(createTweet) //done
router.route('/get-user-tweets/:username').get(getUserTweets) //done
router.route('/update-tweet/:tweetId').patch(updateTweet) //done
router.route('/delete-tweet/:tweetId').delete(deleteTweet) //done







export default router