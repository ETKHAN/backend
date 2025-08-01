import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {

    const { username, password, fullName, email } = req.body;
    const { avatar, coverImage } = req.files;
    if(
      [fullName, username, password, email].some(field => field?.trim() === '')
    ){
      throw new ApiError(401, 'A required parameter is empty of missing!');
    }
    
    if(!avatar) throw new ApiError(401, 'Avatar is required!');




    const userExists = await User.findOne({
      $or: [{ username }, { email }]
    });


    if (userExists) {
      throw new ApiError(409, 'The user is already registered in DB!!!');
    }



    let uploadedCoverImage;
    const uploadedAvatar = await uploadOnCloudinary(avatar[0].path);
    if(coverImage) uploadedCoverImage = await uploadOnCloudinary(coverImage[0].path);



    const user = await User.create({
      username : username.toLowerCase(),
      email,
      password,
      fullName,
      avatar : uploadedAvatar.url,
      coverImage : uploadedCoverImage.url || '',
    });


    const createdUser = await User.findById(user._id).select('-password -refreshToken');


    if(!createdUser) throw new ApiError(500, 'Server is unable able to register user');

    

    res.status(201).json(
      new ApiResponse(201, createdUser, 'New User Created Successfully')
    );
})


async function generateAccessRefreshToken(userId){


  try{
    const user = await User.findById(userId);
  
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();
  
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave : false });
  
    return {refreshToken, accessToken};
    

  }catch(err){

    console.log('ERR :: ', err.message);
    throw new ApiError(500, 'Unable to generate Tokens!!!');

  }

}

const loginUser = asyncHandler(async (req, res) => {

    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie


    const { email, password, username } = req.body;
    
    if (![email, username].some(field => field?.trim() !== '')) {
      throw new ApiError(401, 'Either Email or Username is required!');
    }

    if(password?.trim() === '') throw new ApiError(401, 'Password is required');


    const user = await User.findOne({
      $or : [{username}, {email}]
    });

    if(!user) throw new ApiError(404, 'The user doesn\'t exist');

    const isPasswordValid = await user.comparePassword(password);

    if(!isPasswordValid) throw new ApiError(401, 'Incorrect Credentials!!!');


    const {accessToken, refreshToken} = await generateAccessRefreshToken(user._id);


    const options = {
      httpOnly : true,
      secure : false,
    }

  res.status(200)
  .cookie('accessToken', accessToken, options)
  .cookie('refreshToken', refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
        username : user.username,
        email : user.email,
        refreshToken,
        accessToken,
        fullName : user.fullName
      },
      'Login Successfull!!!'
    )
  )
})


const logoutUser = asyncHandler(async (req, res) => {

  await User.findByIdAndUpdate(
    req.user._id, 
    {
      $unset: { refreshToken: 1 }
    },
    {new: true}
  );



  // res.status(200).json({ message : 'OKAY'});

  const options = {
    httpOnly : true,
    secure : false
  }

  res.status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json({
      message : 'user logged out successfully!!!'
    })
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if(!incomingRefreshToken) throw new ApiError(400, 'Unauthorized Request!!!');

  try{
    
    const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedRefreshToken._id);

    if(!user) throw new ApiError(401, 'User does not exist!!!');

    if(incomingRefreshToken !== user.refreshToken) throw new ApiError(401, 'Unauthorized request, Access Denied!');

    const {refreshToken, accessToken} = await generateAccessRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure : false,
    }

    res.status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          'Access Token Refreshed'
        )
      )

    

  }catch(err){
    throw new ApiError(500, err?.message || 'Unable to recover AccessToken');
  }

})


const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if(!oldPassword?.trim() || !newPassword?.trim()) throw new ApiError(400, 'Inavlid old or new password');

  const user = await User.findById(req.user?._id);

  if(!user) throw new ApiError(401, 'User does not exist!');

  user.password = newPassword;
  user.save({validateBeforeSave : false});

  res.status(200).json(new ApiResponse(200, {}, 'Password changed successfully!!!'));
});

const getCurrentUser = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user?._id).select('-password -refreshToken');

  if(!user) throw new ApiError(400, 'User does not exist');

  res.status(200)
  .json(
    new ApiResponse(200, {data : user}, 'User Fetched successfully!!!')
  );
})


const getUserChannelProfile = asyncHandler(async (req, res) => {
  const {userChannel} = req.params;

  if(!userChannel) throw new ApiError(400, 'User Channel Profile name is missing!');


  const channelProfile = await User.aggregate( [
    {
      $match : {username : userChannel?.toLowerCase()}
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'channel',
        as: 'subscribers'
      }
    },
    {
      $lookup : {
        from : 'subscriptions',
        localField : '_id',
        foreignField : 'subscriber',
        as : 'subscribedTo'
      }
    },
    {
      $addFields : {
        subscribersCount : {$size : '$subscribers'},
        subscribedToCount : {$size : '$subscribedTo'},
        isSubscribed : {
          $cond : {
            if : { $in : [req.user?._id, '$subscribers.subscriber']},
            then : true,
            else : false,
          }
        }
      }
    },
    {
      $project : {
        username : 1,
        fullName : 1,
        avatar : 1,
        coverImage : 1,
        subscribedToCount : 1,
        subscribersCount : 1,
        isSubscribed : 1,
      }
    }
  ] )

  console.log(channelProfile);

  if(!channelProfile) throw new ApiError(400, 'Channel does not exist!');

  res.status(200)
    .json(
      new ApiResponse(200, channelProfile[0], 'Channel Profile Details fetched successfully!!!')
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {

  const pipeline = [
    { $match : {_id : req.user?._id} },
    { 
      $lookup : {
        from : 'videos',
        localField : 'watchHistory',
        foreignField : '_id',
        as : 'watchHistory',
        pipeline : [
          {
            $lookup : {
              from : 'users',
              localField : 'owner',
              foreignField : '_id',
              as : 'owner',
              pipeline : [
                {
                  $project : {
                    username: 1,
                    fullName : 1,
                    avatar : 1,
                  }
                }
              ]
            }
          },
          {
            $addFields : {
              owner : {$first : '$owner'}
            }
          }
        ]
      }
    }
  ]


  const watchHistory = await User.aggregate( pipeline );




  res.status(200).json(
    new ApiResponse(200, watchHistory[0], 'Watch History Fetched Successfully!!!')
  )


})


export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
}