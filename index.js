const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
var cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@laptopwarehouse.alehg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();

    const laptopCollection = client.db("AllLaptop").collection("Laptop");

    // GET API
    app.get("/laptops", async (req, res) => {
      const result = await laptopCollection.find({}).toArray();
      res.send(result);
    });

    // POST API
    app.post("/laptop", async (req, res) => {
      const data = req.body;
      const result = await laptopCollection.insertOne(data);
      res.send(result);
    });

    // DELETE API
    app.delete("/laptop/:id", async (req, res) => {
      const id = req.params.id;
      const deletedItem = { _id: ObjectId(id) };
      const result = await laptopCollection.deleteOne(deletedItem);
      res.send(result);
    });

    // PUT API
    app.put("/laptop/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const deletedItem = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: data.name,
          image: data.image,
          description: data.description,
          price: data.price,
          quantity: data.quantity,
          supplierName: data.supplierName,
        },
      };
      const result = await laptopCollection.updateOne(deletedItem, updateDoc, options);
      res.send(result);
    });
  } finally {

  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
