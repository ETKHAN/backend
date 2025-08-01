import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if(!content?.trim()) throw new ApiError(400, 'content of the tweet is missing!!');

  const tweet = await Tweet.create({
    content,
    owner : new mongoose.Types.ObjectId(req.user._id),
  })

  if(!tweet) throw new ApiError(500, 'unable to create tweet!!');

  res.status(200).json(
    new ApiResponse(200, {tweet}, 'new tweet created successfully!!!')
  );

});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  console.log(userId);
  if(!userId) throw new ApiError(400, 'user Id is required!!!');

  const tweets = await Tweet.aggregate( [{ $match : { owner : new mongoose.Types.ObjectId(userId) } }] );

  res.status(200).json(
    new ApiResponse(200, {tweets}, 'tweets fetched')
  )
})

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  const newTweet = await Tweet.findByIdAndUpdate(
    tweetId, 
    { content },
    { new: true },
  );


  if(!newTweet) throw new ApiError(401, 'unable to find tweet!');


  res.status(200).json(
    new ApiResponse(200, {newTweet}, 'tweet updated successfully!!')
  )


})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    console.log(tweetId);

    const tweet = await Tweet.findByIdAndDelete(tweetId);

    if(!tweet) throw new ApiError(400, 'tweet was not found!');

    res.status(200).json(
      new ApiResponse(200, {}, 'tweet deleted successfully!')
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}