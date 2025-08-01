import { Router } from "express";
import { 
  deleteVideo, 
  getAllVideos, 
  getVideoById, 
  publishAVideo, 
  togglePublishStatus 
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import userAuthentication from "../middlewares/auth.middleware.js";


const router = Router();

router.route('/all').get(getAllVideos);
router.route('/publish-video').post(
  userAuthentication,
  upload.fields([
    {
      name : 'videoFile',
      maxCount: 1,
    },
    {
      name : 'thumbnail',
      maxCount : 1,
    }
  ]),
  publishAVideo,
);
router.route('/get-video').get(userAuthentication, getVideoById);
router.route('/delete-video').delete(userAuthentication, deleteVideo);
router.route('/toggle-publish-status').patch(userAuthentication, togglePublishStatus);


export default router;