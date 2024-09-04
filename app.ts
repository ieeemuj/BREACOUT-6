import express from 'express';
import {configDotenv} from "dotenv";
import cors from 'cors';

import team from "./modules/team";

configDotenv();
const app = express();
app.use(cors({
    origin: '*'
}));
app.use(express.json());

app.use('/team', team);

if (!process.env.VERCEL) {
  app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
  });
}

export default app;
