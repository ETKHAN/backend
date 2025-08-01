import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const {videoId} = req.params;
  const {page = 1, limit = 10} = req.query;

  if(!isValidObjectId(videoId)) throw new ApiError(400, 'video Id is invalid');

  const videoComments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId('6889fade03619a9e051bdf14')
      }
    },
    {
      $group: {
        _id: "$video",
        comments: { $push: "$content" }
      }
    },
    {
      $unwind: "$comments"
    },
    {
      $skip : (Number(page) - 1) * Number(limit)
    },
    {
      $limit : Number(limit),
    }
  ]);

  res.status(200).json(
    new ApiResponse(200, {videoComments}, 'comments fetched successfully!')
  )


})

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  
  if(!isValidObjectId(videoId)) throw new ApiError(400, 'video Id is not valid!!!');
  if(!content?.trim()) throw new ApiError(400, 'content is required!');

  const comment = await Comment.create({
    content,
    video : new mongoose.Types.ObjectId(videoId),
    owner : new mongoose.Types.ObjectId(req.user._id),
  });

  res.status(200).json(
    new ApiResponse(200, {comment}, 'comment added successfully!')
  )
})

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if(!isValidObjectId(commentId)) throw new ApiError(400, 'comment Id is not valid!');

  if(!content?.trim()) throw new ApiError(400, 'content of comment is missing!');



  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      content,
    },
    { new : true}
  );

  if(!updatedComment) throw new ApiError(400, 'comment not found!');

  res.status(200).json(
    new ApiResponse(200, {updatedComment}, 'comment updated Successfully!')
  )

})

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (String(comment.owner) !== String(req.user._id)) {
    throw new ApiError(403, 'Not authorized to delete this comment!')
  }

  await comment.deleteOne();


  res.status(200).json(
    new ApiResponse(200, {}, 'comment deleted successfully!')
  );
})

export {
  getVideoComments, 
  addComment, 
  updateComment,
  deleteComment
}