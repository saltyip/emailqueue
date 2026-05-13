import express from "express";
import dotenv from "dotenv";
import { emailQueue } from "./queue.js";

dotenv.config();
const app = express();
app.use(express.json());

app.post("/send-email", async (req, res) => {
  const { to, subject, body } = req.body; //get info from the body request

  if (!to || !subject || !body) {
    return res.status(400).json({ error: "to subject body are required " });
  }

  const job = await emailQueue.add(
    //basically wait till the job gets added to the waiting queue
    "send-email",
    { to, subject, body }, //this is the data that gets added
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  );
  res.json({ jobId: job.id, status: "queued" });
});

app.get("/job/:id/status", async (req, res) => {
  const job = await emailQueue.getJob(req.params.id);

  if (!job) {
    return res.status(400).json({ error: "job not found" });
  }

  const state = await job.getState();
  res.json({ jobId: job.id, state, data: job.data });
});

app.listen(process.env.PORT, () => {
  console.log(`server running on port ${process.env.PORT}`);
});
