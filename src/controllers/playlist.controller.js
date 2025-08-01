import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
  const {name, description} = req.body

  if( !name?.trim() || !description?.trim() ) throw new ApiError(400, 'name and description are required!');


  const playlist = await Playlist.create({
    name,
    description,
    videos : [],
    owner : new mongoose.Types.ObjectId(req.user?._id),
  });

 
  res.status(200).json(
    new ApiResponse(200, {playlist}, 'playlist created successfully!')
  );
})

const getUserPlaylists = asyncHandler(async (req, res) => {
  const {userId} = req.params
  //TODO: get user playlists
  if(!isValidObjectId) throw new ApiError(400, 'invalid user Id');
  const playlists = await Playlist.find({ owner : new mongoose.Types.ObjectId(userId) });


  res.status(200).json(
    new ApiResponse(200, {playlists}, 'playlists fetched successfully!')
  );
})

const getPlaylistById = asyncHandler(async (req, res) => {
  const {playlistId} = req.params
  //TODO: get playlist by id
  if(!isValidObjectId(playlistId)) throw new ApiError(400, 'invalid playlist id');
  const playlist = await Playlist.findById(playlistId);

  if(!playlist) throw new ApiError(403, 'playlist does not exist!');

  res.status(200).json(
    new ApiResponse(200, {playlist}, 'playlist fetched successfully')
  );
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const {playlistId, videoId} = req.params;

  if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new ApiError(400, 'playlist or video Id is invalid!');

  const playlist = await Playlist.findById(playlistId);

  if(!playlist) throw new ApiError(400, 'playlist does not exist!');

  const video = await Video.findById(videoId);

  if(!video) throw new ApiError(400, 'video does not exist!');


  playlist.videos.push(video._id);

  await playlist.save();

  res.status(200).json(
    new ApiResponse(200, {playlist}, 'video added to playlist successfully!')
  )


})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const {playlistId, videoId} = req.params


  if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new ApiError(400, 'playlist or video Id is invalid!');

  const playlist = await Playlist.findById(playlistId);

  if(!playlist) throw new ApiError(400, 'playlist does not exist!');

  const index = Array.isArray(playlist.videos)
    ? playlist.videos.findIndex(video => String(video) === String(videoId))
    : -1;
  console.log(index);

  if(index === -1) throw new ApiError(400, 'video is not in the playlist!');

  playlist.videos.splice(index, 1);

  await playlist.save();

  res.status(200).json(
    new ApiResponse(200, {playlist}, 'video removed successfully!')
  );
  


})

const deletePlaylist = asyncHandler(async (req, res) => {
  const {playlistId} = req.params

  if(!isValidObjectId(playlistId)) throw new ApiError(400, 'playlist id is not valid');

  await Playlist.findByIdAndDelete(playlistId);

  res.status(200).json(
    new ApiResponse(200, {}, 'playlist deleted successfully!')
  )

})

const updatePlaylist = asyncHandler(async (req, res) => {
  const {playlistId} = req.params
  const {name, description} = req.body
  //TODO: update playlist

  if(!isValidObjectId(playlistId)) throw new ApiError(400, 'playlist id is not valid');
  if( !name?.trim() || !description?.trim() ) throw new ApiError(400, 'name and description are required!');

  const playlist = await Playlist.findById(playlistId);

  if(!playlist) throw new ApiError(400, 'playlist does not exist!');


  playlist.name = name ?? playlist.name;
  playlist.description = description ?? playlist.description;
  
  await playlist.save();



  res.status(200).json(
    new ApiResponse(200, {playlist}, 'playlist updated successfully')
  )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}