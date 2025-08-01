import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
  username : {
    type: String,
    unique: true,
    trim : true,
    index: true,
    lowercase:true,
    required: true,
  },
  
  email : {
    type: String,
    unique: true,
    trim : true,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    required: true,

  },
  coverImage: {
    type:String,
  },
  watchHistory: [
    {
      type: Schema.Types.ObjectId,
      ref : 'Video',
      default: []
    }
  ],
  password: {
    type: String,
    required: [true, 'password is required']
  },
  refreshToken:{
    type: String,
  }

  
},{timestamps: true});


userSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next();


  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password){

  return await bcrypt.compare(password, this.password); // TO BE checked!!!!
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }

  )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }

  )
}


export const User = mongoose.model('User', userSchema);