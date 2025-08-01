import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const videoStats = await Video.aggregate([
    {
      $match : {owner : new mongoose.Types.ObjectId(userId)}
    },
    {
      $group : {
        _id : '$owner',
        totalVideos : { $sum : 1 },
        totalViews : {$sum : '$views'},
      }
    }
  ])

  const totalSubscribers = await Subscription.countDocuments({
    channel : new mongoose.Types.ObjectId(userId),
  })


  const totalLikes = await Like.aggregate([
    {
      $lookup : {
        from : 'videos',
        localField : 'video',
        foreignField : '_id',
        as : 'videoDetails'
      }
    },
    {
      $unwind : '$videoDetails',
    },
    {
      $addFields : {
        owner : '$videoDetails.owner'
      },
    },
    {
      $group : {
        _id : '$owner',
        totalLikes : {$sum : 1}
      }
    },
  ])

  const channelStats = { totalLikes, totalSubscribers, videoStats };
  res.status(200).json(
    new ApiResponse(200, {channelStats}, 'channel stats fetched successfully!!!')
  )
})

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const userId = req.user?._id;


    const videos = await Video.aggregate([
    {
      $match : {owner : new mongoose.Types.ObjectId(userId)}
    }
  ])


  res.status(200).json(
    new ApiResponse(200, {videos}, 'videos fetched successfully!')
  )


})

export {
  getChannelStats, 
  getChannelVideos
}