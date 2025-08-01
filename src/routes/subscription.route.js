import { Router } from "express";
import userAuthentication from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();



router.route('/subscribe').post(userAuthentication, toggleSubscription);
router.route('/get-subscribed-channels').get(getSubscribedChannels);
router.route('/get-channel-subscribers').get(getUserChannelSubscribers)

export default router;