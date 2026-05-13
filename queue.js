import { Queue } from "bullmq";

const connection = {
  //making connection of host and port
  host: "localhost",
  port: 6379,
};

export const emailQueue = new Queue("emails", { connection }); //exporting a queue with var = emailQueue and redis name = emails on the connection
export { connection }; //exporting the connection

//this file creates a queue of bullmq
