import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";


const getAllVideos = asyncHandler(async (req, res) => {
  
  const { page = 1, limit = 10, query = '', sortBy, sortType, userId } = req.query

  const sortOrder = sortType === 'asc' ? 1 : -1;


  const videos = await Video.aggregate([
    {
      $match: {
        title: { $regex: query, $options: 'i' }
      }
    },
    {
      $sort: {
        [sortBy]: sortOrder
      }
    },
    {
      $skip: (Number(page) - 1) * Number(limit) // optional: pagination
    },
    {
      $limit: Number(limit) // optional: pagination
    }
  ]);


  res.status(200).json(
    new ApiResponse(200, videos, 'Video Fetched Successfully!!!')
  )


    

    
})

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description} = req.body;

  console.log('title - ', title);
  console.log('description - ', description);

  if(!title) throw new ApiError(400, 'title is required for the video');
  
  const { videoFile, thumbnail } = req.files;

  if(!videoFile || !thumbnail) throw new ApiError(400, 'thumbnail and video file is missing!');

  const uploadedVideoFile = await uploadOnCloudinary(videoFile[0].path);
  const uploadedThumbnail = await uploadOnCloudinary(thumbnail[0].path);

  console.log('durationOfVideo - ', uploadedVideoFile.duration);


  const publishedVideo = await Video.create({
    title,
    thumbnail: uploadedThumbnail.url,
    videoFile: uploadedVideoFile.url,
    description : description || null,
    duration : uploadedVideoFile.duration,
    isPublished : true,
    owner : new mongoose.Types.ObjectId(req.user._id),
  });

  console.log(publishedVideo);

  res.status(200)
  .json(
    new ApiResponse(200, publishedVideo, 'Video Published Successfully!')
  )

});



const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.query



  const video = await Video.findById(videoId);


  if(!video) throw new ApiError(401, 'Video does not exist!!!');


  res.status(200)
    .json(
      new ApiResponse(200, video, 'Video Fetched successfully!!!')
    );


});


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.query
    
    const video = await Video.findById(videoId);

    if(!video) throw new ApiError(400, 'Video does not exists!');


    if(req.user._id.toString() !== video.owner.toString())
      throw new ApiError(401, 'The Video Does not belongs to the user!');

    await Video.findByIdAndDelete(videoId);

    res.status(200).json(
      new ApiResponse(200, {}, 'video is removed successfully')
    );
})


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId)

    if(!video) throw new ApiError(400, 'Video does not exists!');

    if(req.user._id.toString() !== video.owner.toString())
      throw new ApiError(401, 'The Video Does not belong to the user!!!');

    video.isPublished = !video.isPublished;

    video.save({validateBeforeSave : false});

    res.status(200).json(
      new ApiResponse(200, video, 'Video Publish status is toggled!')
    );
})


export { 
  getAllVideos,
  publishAVideo,
  getVideoById,
  deleteVideo,
  togglePublishStatus,
}