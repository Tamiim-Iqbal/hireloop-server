import express from "express";

const app = express();
const PORT = process.env.PORT || 8000;

// middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello from Hireloop!");
});

app.listen(PORT, () => {
  console.log(`Hireloop server is running on port ${PORT}`);
});