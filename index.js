import express from "express";
import cors from "cors";
import 'dotenv/config';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 8000;

// middleware
app.use(express.json());
app.use(cors());

// mongodb
const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } 
  catch (err) {
    console.dir(err);
  }
}

const connectedClient = await connectToMongoDB();
const database = connectedClient.db("hireloop");
const users = database.collection("user");
const jobs = database.collection("jobs");

app.get("/", (req, res) => {
  res.send("Hello from Hireloop!");
});

// Get users 
app.get('/users', async (req, res) => {
    const cursor = users.find({});
    const result = await cursor.toArray();
    res.send(result);
})

// Get jobs
app.get('/jobs', async (req, res) => {
    const cursor = jobs.find({});
    const result = await cursor.toArray();
    res.send(result);
})

app.post('/jobs', async (req, res) => {
  const job = req.body;
  const result = await jobs.insertOne(job);
  res.send(result);
})

app.listen(PORT, () => {
  console.log(`Hireloop server is running on port ${PORT}`);
});