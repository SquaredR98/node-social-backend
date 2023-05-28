import mongoose from "mongoose";
import { config } from "./config";

export default () => {
  const connect = () => {
    mongoose.connect(`${config.DATABASE_URI!}`, {})
      .then(() => {
        console.log('Succesfully connected to DB...')
      })
      .catch(error => {
        console.log('Error connecting to DB...', error);
        return process.exit(1);
      })
  };
  connect();

  mongoose.connection.on('disconnected', connect);
}