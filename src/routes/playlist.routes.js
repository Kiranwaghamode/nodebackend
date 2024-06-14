import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";


const router = Router()

router.use(verifyJWT)

router.route('/create-playlist').post(createPlaylist) //done
router.route('/get-playlist/:playlistId').get(getPlaylistById) //done
router.route('/add-video-to-playlist').post(addVideoToPlaylist) //done
router.route('/get-user-playlists/:userId').get(getUserPlaylists) //done
router.route('/update-playlist/:playlistId').patch(updatePlaylist) //done
router.route('/remove-video-from-playlist').patch(removeVideoFromPlaylist) //done
router.route('/delete-playlist/:playlistId').delete(deletePlaylist) //done


//sample {playlistID : 666bb97d4efe18004b818cae}
//sample {videoID : 666b3d0d2a0c2d81caf87ad0}
//sample {userID : 665634143d9aa27caffc93d3}


export default router;