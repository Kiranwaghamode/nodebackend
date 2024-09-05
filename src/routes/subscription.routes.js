import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, toggleSubscription } from "../controllers/subscription.controller.js";


const router = Router()
router.use(verifyJWT)


router.route("/subscription-toggle/:channelId").patch(toggleSubscription)
router.route("/subscribed-channels/").get(getSubscribedChannels)



export default router;

