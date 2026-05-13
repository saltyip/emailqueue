import { Worker } from "bullmq"; //the worker basically like take the job one by one from the waiting queue(underhand in redis its basically rpop ig of waiting queue hash maybe )
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { connection } from "./queue.js";
import { pool } from "./db.js";
dotenv.config();

const transporter = nodemailer.createTransport({
  //basically a transporter or a like the thing/service which controls are thing to send email
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

//creating a worker
//  controlling redis name queue = emails
const worker = new Worker(
  "emails",
  async (job) => {
    //controlling each job
    const { to, subject, body } = job.data; //so for job got from waiting queue  take its data basically
    console.log(
      `sending emails to: ${to},job: ${job}, attempt:${job.attemptsMade + 1}`,
    );

    await transporter.sendMail({
      //give info to transporter to get the to from subject text etc
      from: process.env.GMAIL_USER,
      to,
      subject,
      text: body,
    });

    console.log(`email set successsfully, job ${job.id}`);
  },
  { connection, concurrency: 2 }, //sets concurerncy of worker to be 2
);

worker.on("completed", async (job) => {
  //if completed state then that
  console.log(`job ${job.id} completed`);
  await pool.query(
    "INSERT INTO job_logs (job_id,status,recipient, subject) VALUES($1,$2,$3,$4)",
    [job.id, "completed", job.data.to, job.data.subject],
  );
});

worker.on("failed", async (job, err) => {
  //if failer or error then that
  console.log(`job ${job.id} failed: ${err.message}`);
  await pool.query(
    "INSERT INTO job_logs (job_id,status,recipient,subject,error) VALUES ($1,$2,$3,$4,$5)",
    [job.id, "failed", job.data.to, job.data.subject, err.message],
  );
});

console.log("worker started, waiting for jobs....");

//this file basically its like creating a Worker function that like tells what do with the a job yk like take its this this data then put it in transpoerter etc etc what to do if the thing completes or fails
//POST /send-email
//     ↓
//emailQueue.add()
//   ↓
//Redis
//↓
//workerorker.js
// ↓
//nodemailer sends email
