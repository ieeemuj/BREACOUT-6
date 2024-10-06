import express from 'express';
import {configDotenv} from "dotenv";
import cors from 'cors';
import jwt from 'jsonwebtoken';

import team from "./modules/team.js";
import clue from "./modules/clue.js";
import admin from "./modules/admin.js";

configDotenv();
const app = express();
app.use(cors({
    origin: '*'
}));
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.url);
  if (req.url === '/team/login' || req.url.startsWith('/admin'))
    return next();

  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({success: false, message: "Token is required"});
  }

  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({success: false, message: "Session expired! Please login again.", code: 1000});
    }
    req.team = decoded;
  });
  next();
});

app.use('/team', team);
app.use('/clue', clue);
app.use('/admin', admin);

app.on('/', (req, res) => {
    res.send('Hello World');
});

if (!process.env.VERCEL) {
  app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
  });
}

export default app;
