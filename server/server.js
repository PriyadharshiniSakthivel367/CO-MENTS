import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

import dotenv from "dotenv";
import connectDB from "./config/database.js"; 

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(server, {
  cors: { origin: clientUrl, methods: ['GET', 'POST'] },
});

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: '64kb' }));

app.use((req, _res, next) => {
  req.io = io;
  next();
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes);

io.on('connection', (socket) => {
  socket.on('join:comments', () => {
    socket.join('comments');
  });
});

const PORT = process.env.PORT || 5001;
const isProd = process.env.NODE_ENV === 'production';

/** Keeps the embedded server process alive for the Node lifetime */
let memoryMongo = null;

async function connectInMemoryMongo() {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryMongo = await MongoMemoryServer.create();
  const uri = memoryMongo.getUri();
  await mongoose.connect(uri, { dbName: 'comment-threads' });
  console.log('Connected to in-memory MongoDB (no local Mongo install required).');
}

async function connectMongo() {
  const raw = process.env.MONGO_URI?.trim();

  if (!raw || raw === 'memory') {
    await connectInMemoryMongo();
    return;
  }

  try {
    await mongoose.connect(raw);
    console.log('Connected to MongoDB.');
  } catch (err) {
    if (isProd) {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    }
    await mongoose.disconnect().catch(() => {});
    console.warn(
      'Could not reach MONGO_URI; falling back to in-memory MongoDB for local development.'
    );
    console.warn(`Reason: ${err.message || err}`);
    await connectInMemoryMongo();
  }
}

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing. Add it to server/.env (see .env.example).');
    process.exit(1);
  }

  try {
    await connectMongo();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }

  server.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
  });
}

start();

dotenv.config();
connectDB();
