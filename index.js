const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

 


const uri = "mongodb+srv://Pet-Zone:IVvvOV3guIrkP8Ly@cluster0.3b178xe.mongodb.net/?retryWrites=true&w=majority";
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
 


       app.get("/petdata", async (req, res) => {
        const result = await petCollection.find().toArray();
        res.send(result);
       });
  
    app.get("/petdata/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: new ObjectId(id) };
      const result = await petCollection.findOne(query);
      res.send(result);
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