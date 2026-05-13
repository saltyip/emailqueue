# Email Queue Service

A background job queue that handles email delivery asynchronously using BullMQ and Redis. Jobs are queued instantly, processed by a worker with concurrency and automatic retry on failure, and logged to PostgreSQL.

## Stack
Node.js, Express, BullMQ, Redis, PostgreSQL, Nodemailer

## Architecture
POST /send-email
↓
emailQueue.add()
↓
Redis
↓
worker.js (concurrency: 2, retries: 3, exponential backoff)
↓
Nodemailer → Gmail SMTP
↓
PostgreSQL (job log)


## Features
- Instant API response — email sending is non-blocking
- Retry with exponential backoff (3 attempts)
- Concurrent job processing
- Job status tracking
- Completed/failed jobs persisted to PostgreSQL


## API
`POST /send-email` — queues an email job
```bash
curl -X POST https://mellow-comfort-production-737e.up.railway.app/send-email \
  -H "Content-Type: application/json" \
  -d '{"to": "example@gmail.com", "subject": "hello", "body": "sent via bullmq"}'
# response
{"jobId":"1","status":"queued"}
```

`GET /job/:id/status` — returns current job state
```bash
curl https://mellow-comfort-production-737e.up.railway.app/job/1/status
# response
{"jobId":"1","state":"completed","data":{"to":"example@gmail.com","subject":"hello","body":"sent via bullmq"}}


```
## Setup
```bash
git clone https://github.com/saltyip/emailqueue
cd emailqueue
npm install
# add .env with GMAIL_USER, GMAIL_PASS, DATABASE_URL, PORT (if needed for gmail_user and gmail_pass 2fa and app password required)
node server.js   # terminal 1
node worker.js   # terminal 2
```

## Live
https://mellow-comfort-production-737e.up.railway.app
