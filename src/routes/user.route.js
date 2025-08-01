import { Router } from "express";
import { 
  changePassword, 
  getCurrentUser, 
  getUserChannelProfile, 
  getWatchHistory, 
  loginUser, 
  logoutUser, 
  refreshAccessToken, 
  registerUser, 
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import userAuthentication from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(
    upload.fields([
      {
        name: 'avatar',
        maxCount: 1,
      },
      {
        name: 'coverImage',
        maxCount: 1,
      }
    ]),
    registerUser
  );

router.route('/login').post(upload.none() ,loginUser);
router.route('/logout').post(userAuthentication, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/change-password').post(upload.none() ,userAuthentication, changePassword);
router.route('/get-current-user').post(userAuthentication, getCurrentUser);
router.route('/get-channel-profile').post(userAuthentication, getUserChannelProfile);
router.route('/get-watch-history').post(userAuthentication, getWatchHistory);


export default router;