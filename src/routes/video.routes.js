import { Router } from 'express';
import { verifyJWT  } from '../middlewares/auth.middleware.js'
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishVideo, updateVideo } from '../controllers/video.controller.js';


const router = Router()

router.use(verifyJWT)

    router.route("/publish-video").post(
        upload.fields([
            {
                name: "thumbnail",
                maxCount: 1
            },
            {
                name: "videoFile",
                maxCount: 1
            }
        ]),
        publishVideo
    )

    router.route("/get-video/:videoId").get(getVideoById)
    router.route("/update-video/:videoId").patch(upload.single("thumbnail"), updateVideo)
    router.route("/delete-video/:videoId").delete(deleteVideo)
    router.route("/get-all-videos").get(getAllVideos)

// example video ID: 6664b08f9deeddab5b4f6fde
//example user ID: 665634143d9aa27caffc93d3

   
export default router;