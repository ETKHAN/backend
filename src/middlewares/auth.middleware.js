import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from "jsonwebtoken";

const userAuthentication = asyncHandler(async (req, res, next) => {

  try{
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer', '');


    if(!token) throw new ApiError(401, 'Unauthorized Request!!!');

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);


    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")


    if(!user) throw new ApiError(401, 'Invalid Access token');

    req.user = user;

    next()

  }catch(err) {
    throw new ApiError(401, err?.message || 'unable to extract data from token!!');

  }
});


export default userAuthentication;

