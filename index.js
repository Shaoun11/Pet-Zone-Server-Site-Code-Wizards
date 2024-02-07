const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://Pet-Zone:IVvvOV3guIrkP8Ly@cluster0.3b178xe.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    const petCollection = client.db("PetZone").collection("Petdata");
    const petAccessories = client.db("PetZone").collection("PetAccessories");
    const userCollection = client.db("PetZone").collection("users");
    const MyCartCollection = client.db("PetZone").collection("mycart");

    app.get("/petdata", async (req, res) => {
      const result = await petCollection.find().toArray();
      res.send(result);
    });
    // Getting Accessories
    app.get("/petshop", async (req, res) => {
      const result = await petAccessories.find().toArray();
      res.send(result);
    });
    // Posting Accessories
    app.post('/petshop', async (req,res) => {
      const newProduct = req.body;
      const result = await petAccessories.insertOne(newProduct);
      res.send(result);
    })
    // Delete Accessories
    app.delete('/petshop/:id', async(req,res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await petAccessories.deleteOne(query);
      res.send(result);
    })


    // Read data to Update Accessories
    app.get("/petshop/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await petAccessories.findOne(query);
      res.send(result);
    })

    // Update Data for Accessories
    app.put("/petshop/:id", async(req,res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true};
      const updatedAccessories = req.body;
      const accessories = {
        $set: {
          name: updatedAccessories.name,
          image: updatedAccessories.image,
          category: updatedAccessories.category,
          animal: updatedAccessories.animal,
          description: updatedAccessories.description,
          price: updatedAccessories.price
        }
      }
      const result = await petAccessories.updateOne(filter, accessories,options);
      res.send(result);
    })





    app.get("/petdata/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: new ObjectId(id) };
      const result = await petCollection.findOne(query);
      res.send(result);
    });
    // app.get("/petshop/:_id", async (req, res) => {
    //   const id = req.params._id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await PetAccessories.findOne(query);
    //   res.send(result);
    // });

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const users = await cursor.toArray();
      res.send(users);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });


    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    })

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          role: "admin"
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })


  

    app.post("/mycart", async (req, res) => {
      const mycart = req.body;
      const result = await MyCartCollection.insertOne(mycart);
      console.log(result);
      res.send(result);
    });

    app.get("/mycart", async (req, res) => {
      const result = await MyCartCollection.find().toArray();
      res.send(result);
    });

    // New route to get cart by email
    app.get("/mycart/:email",async (req, res) => {
      const userEmail = req.params.email;
      const result = await MyCartCollection.find().toArray();
      const userCart = result.filter((item) => item.email === userEmail);
      res.json(userCart);
    });

    client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`PetZone`);
});

app.listen(port, () => {
  console.log(`Server: ${port}`);
});
