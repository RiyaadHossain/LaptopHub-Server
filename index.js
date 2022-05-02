const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

    // For MyItems GET API
    app.get("/myitems", async (req, res) => {
      const tokenInfo = req.headers.authorization;
      const [email, accessToken] = tokenInfo.split(" ");
      const decoded = verifyToken(accessToken);
      if (email === decoded.email) {
        const result = await laptopCollection.find({ email: email }).toArray();
        res.send(result);
      } else {
        res.send({ success: "UnAuthoraized Access" });
      }
    });

    // POST API
    app.post("/laptop", async (req, res) => {
      const data = req.body;
      const tokenInfo = req.headers.authorization;
      const [email, accessToken] = tokenInfo.split(" ");
      const decoded = verifyToken(accessToken);
      if (email === decoded.email) {
        const result = await laptopCollection.insertOne(data);
        res.send({ success: "Product Upload Successfully" });
      } else {
        res.send({ success: "UnAuthoraized Access" });
      }
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
      const filter = { _id: ObjectId(id) };
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
      const result = await laptopCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // PUT API for Quantity
    app.put("/laptopQuantityUpdate/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: data.quantity,
        },
      };
      const result = await laptopCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // For JWT Token
    app.post("/login", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.SECRET_TOKEN);
      res.send({ token });
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

// Function: Verify Token
function verifyToken(token) {
  let email;
  jwt.verify(token, process.env.SECRET_TOKEN, function (err, decoded) {
    if (err) {
      email = "Invalid email";
    }
    if (decoded) {
      email = decoded;
    }
  });
  return email;
}
