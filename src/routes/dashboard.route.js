import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js"
import userAuthentication from "../middlewares/auth.middleware.js"

const router = Router();

router.use(userAuthentication); // Apply userAuthentication middleware to all routes in this file

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router