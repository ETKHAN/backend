import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';


dotenv.config({
  path: './.env',
});


connectDB().then(() => {
  app.on('error', (error) => {
    console.log('unable to start the server');
    throw error;
  })

  app.listen(process.env.PORT, () => {
    console.log('Server is listenning on PORT : ', process.env.PORT)
  })
  
})

