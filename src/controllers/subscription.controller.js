import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const {channelId} = req.query

  if(!channelId) throw new ApiError(400, 'channelId is required!!');
    
   
    // Check If Subscribed;
  const isChannelSubscribed = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
        subscriber: new mongoose.Types.ObjectId(req.user._id)
      }
    }
  ]);

  if(isChannelSubscribed.length){
    await Subscription.findByIdAndDelete(isChannelSubscribed[0]._id);

    res.status(200).json(
      new ApiResponse(200, {channelId}, 'channel is unsubscribed!')
    )

  }else{
    await Subscription.create({
      channel : new mongoose.Types.ObjectId(channelId),
      subscriber : new mongoose.Types.ObjectId(req.user._id)
    })

    res.status(200).json(
      new ApiResponse(200, {channelId}, 'channel is subscribed!')
    )

  }


});


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.query;

  if (!channelId) throw new ApiError(400, 'channelId is required!');

  const subscribersCount = await Subscription.countDocuments({
    channel: new mongoose.Types.ObjectId(channelId),
  });

  res.status(200).json(
    new ApiResponse(200, {subscribersCount}, 'Subscribers count fetched!')
  );
});


const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.query;

  if (!subscriberId) throw new ApiError(400, 'subscriberId is required!');

  const subscribedToCount = await Subscription.countDocuments({
    subscriber: new mongoose.Types.ObjectId(subscriberId),
  });

  res.status(200).json(
    new ApiResponse(200, {subscribedToCount}, 'Subscribed-to count fetched!')
  );
});



export {
  toggleSubscription,
  getSubscribedChannels,
  getUserChannelSubscribers,
}