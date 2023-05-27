import mongoose from "mongoose";

export default () => {
  const connect = () => {
    mongoose.connect('mongodb://127.0.0.1:27017/test', {})
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