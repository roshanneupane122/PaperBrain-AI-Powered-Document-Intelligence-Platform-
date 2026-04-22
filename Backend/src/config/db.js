import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('CRITICAL: MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }
    
    // Log masked URI for debugging
    const maskedUri = uri.replace(/\/\/.*@/, '//****:****@');
    console.log(`Attempting to connect to MongoDB: ${maskedUri}`);

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.error('ERROR: Connection refused. If you are using a local MongoDB, make sure it is running.');
    }
    process.exit(1);
  }
};

export default connectDB;
