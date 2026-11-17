import express from "express";
import cors from "cors";
import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { ObjectId } from "mongodb";

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

// Jobs related APIs  
app.get('/jobs', async (req, res) => {

    const query = {};

    if(req.query){
      if(req.query.jobType){
        query.jobType = req.query.jobType;
      }
      if(req.query.remoteAllowed)
      {
        query.remoteAllowed = req.query.remoteAllowed === 'true';
      }
      if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { company: { $regex: req.query.search, $options: 'i' } },
                { responsibilities: { $regex: req.query.search, $options: 'i' } },
                { requirements: { $regex: req.query.search, $options: 'i' } }
            ];
        }
    }

    const cursor = jobs.find(query);
    const result = await cursor.toArray();
    res.send(result);
})

app.post('/jobs', async (req, res) => {
  const job = req.body;
  const result = await jobs.insertOne(job);
  res.send(result);
})

app.delete('/jobs/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid Job ID"
      });
    }

    const query = { _id: new ObjectId(id) };

    const result = await jobs.deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Job not found"
      });
    }

    res.send({
      success: true,
      message: "Job deleted successfully",
      result
    });

  } catch (error) {
    console.error("Delete Job Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to delete job"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Hireloop server is running on port ${PORT}`);
});