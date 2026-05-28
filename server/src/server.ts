import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app';

const { DB_USER, DB_PWD, DB_NAME, PORT = '5000' } = process.env;

mongoose
  .connect(
    `mongodb://${DB_USER}:${DB_PWD}@clustere31-shard-00-00.bxve7.mongodb.net:27017,clustere31-shard-00-01.bxve7.mongodb.net:27017,clustere31-shard-00-02.bxve7.mongodb.net:27017/${DB_NAME}?ssl=true&replicaSet=atlas-xoqmrr-shard-0&authSource=admin&retryWrites=true&w=majority&appName=ClusterE31`
  )
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(Number(PORT), () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
