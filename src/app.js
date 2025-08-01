import express, { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorMiddleware } from './middlewares/error.middleware.js';


const app = express();

app.use(cors(
  {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }
))
app.use(express.json({limit: '16kb'}));
app.use(cookieParser());
app.use(urlencoded({limit: '16kb',extended:true}));
app.use(express.static('public'))




// ROUTER IMPORTS


// Health Check Route
import healthRouter from "./routes/healthCheck.route.js";
app.use('/api/v1/health-check', healthRouter);

// User Router
import userRouters from "./routes/user.route.js";
app.use('/api/v1/users', userRouters);

// Video Router
import videoRouter from "./routes/video.route.js";
app.use('/api/v1/videos', videoRouter);

// Subscription Router
import subscriptionRouter from "./routes/subscription.route.js";
app.use('/api/v1/subscription', subscriptionRouter);

// Tweet Router
import tweetRouter from "./routes/tweet.route.js";
app.use("/api/v1/tweets", tweetRouter)

// Like Router
import likeRouter from "./routes/like.route.js";
app.use("/api/v1/likes", likeRouter)

// Comment Router
import commentRouter from "./routes/comment.route.js";
app.use("/api/v1/comments", commentRouter)

// Dashboard Router
import dashboardRouter from "./routes/dashboard.route.js";
app.use("/api/v1/dashboard", dashboardRouter);

// Playlist Router
import playlistRouter from "./routes/playlist.route.js";
app.use("/api/v1/playlist", playlistRouter);







// Error Handling middleware
app.use(errorMiddleware);

export { app }