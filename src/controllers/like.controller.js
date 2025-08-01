import mongoose, {isValidObjectId} from "mongoose";
import {Like} from "../models/like.model.js";
import {ApiError} from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const {videoId} = req.params;

  if(!isValidObjectId(videoId)) throw new ApiError(400, 'videoId is not valid!');

  const like = await Like.aggregate( [
    { $match : {
        video : new mongoose.Types.ObjectId(videoId),
        likedBy : new mongoose.Types.ObjectId(req.user._id),
      }
    }
  ] );

  if(like.length === 0){
    const liked = await Like.create({
      likedBy : new mongoose.Types.ObjectId(req.user._id),
      video : new mongoose.Types.ObjectId(videoId),
    });

    res.status(200).json(
      new ApiResponse(200, {liked}, 'video is liked')
    )

  }else{
    
    if(!isValidObjectId(like[0]._id)) throw new ApiError(500, 'like not found!');
    const unlike = await Like.findByIdAndDelete(like[0]._id);

    res.status(200).json(
      new ApiResponse(200, {unlike}, 'video is unliked!')
    )

  }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
  const {commentId} = req.params;


  if(!isValidObjectId(commentId)) throw new ApiError(400, 'commentId is not valid!');

  const like = await Like.aggregate( [
    { $match : {
        comment : new mongoose.Types.ObjectId(commentId),
        likedBy : new mongoose.Types.ObjectId(req.user._id),
      }
    }
  ] );

  if(like.length === 0){
    const liked = await Like.create({
      likedBy : new mongoose.Types.ObjectId(req.user._id),
      comment : new mongoose.Types.ObjectId(commentId),
    });

    res.status(200).json(
      new ApiResponse(200, {liked}, 'video is liked')
    )

  }else{
    
    if(!isValidObjectId(like[0]._id)) throw new ApiError(500, 'like not found!');
    const unlike = await Like.findByIdAndDelete(like[0]._id);

    res.status(200).json(
      new ApiResponse(200, {unlike}, 'video is unliked!')
    )

  }

  

})

const toggleTweetLike = asyncHandler(async (req, res) => {
  const {tweetId} = req.params

    if(!isValidObjectId(tweetId)) throw new ApiError(400, 'tweetId is not valid!');

  const like = await Like.aggregate( [
    { $match : {
        tweet : new mongoose.Types.ObjectId(tweetId),
        likedBy : new mongoose.Types.ObjectId(req.user._id),
      }
    }
  ] );

  if(like.length === 0){
    const liked = await Like.create({
      likedBy : new mongoose.Types.ObjectId(req.user._id),
      tweet : new mongoose.Types.ObjectId(tweetId),
    });

    res.status(200).json(
      new ApiResponse(200, {liked}, 'tweet is liked')
    )

  }else{
    
    if(!isValidObjectId(like[0]._id)) throw new ApiError(500, 'like not found!');
    const unliked = await Like.findByIdAndDelete(like[0]._id);

    res.status(200).json(
      new ApiResponse(200, {unliked}, 'tweet is unliked!')
    )

  }
  
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
  if(!isValidObjectId(req.user._id)) throw new ApiError(401, 'unauthorized request!');

  const videos = await Like.aggregate([
    {
      $match : {
        likedBy : new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup : {
        from : 'videos',
        localField : 'video',
        foreignField : '_id',
        as : 'video'
      }
    },
    {
      $unwind : '$video',
    },
    {
      $project : {
        video : 1,
        likedBy : 1,
      }
    }
  ]);

  res.status(200).json(
    new ApiResponse(200, {videos}, 'fetched liked videos!')
  )
})

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos
}