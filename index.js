const express = require("express");
const cors = require("cors");
const stripe = require('stripe')("sk_test_51OK2mgGYIbORFhiIULSnSe0yCE1elq8GnEAzsYzxBwDIVGoBXBwokeqjaqxnhIa2DxSjXEMOxDNcy0PCM8ScbzaP00wFZXkThc");                 
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
    const reviewsCollection = client.db("PetZone").collection("reviews");
    const MyCartCollection = client.db("PetZone").collection("mycart");
    const paymentCollection = client.db("PetZone").collection("payments");  
    const bookingCollection = client.db("PetZone").collection("BookingCollection");
    const sellerCollection = client.db("PetZone").collection("seller");

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
  



    //all pet data
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



    

    //all user
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const users = await cursor.toArray();
      res.send(users);
    });

    //user post
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
    });

    //create admin
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const user = await userCollection.findOne(filter);
      const updatedRole = user.role === "admin" ? "user" : "admin";
      const updatedDoc = {
        $set: {
          role: updatedRole,
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    //add pet
    app.post("/petdata", async (req, res) => {
      const newPet = req.body;
      console.log(newPet);
      const result = await petCollection.insertOne(newPet);
      res.send(result);
    });



    //Accepted pet
    app.patch("/petdata/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "accepted",
        },
      };
      const result = await petCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.get("/productsCount", async (req, res) => {
      const count = await petCollection.estimatedDocumentCount();
      res.send({ count });
    })
  
    //payment getway
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      console.log(amount, "Amount inside the intent");
    
      const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          payment_method_types: ["card"]
      });
    
      res.send({
          clientSecret: paymentIntent.client_secret
      })
    })


    app.get('/products', async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);

      const result = await petCollection.find({ status: 'accepted' }).skip(page * size).limit(size).toArray();
      res.send(result);
    })

    //cart manage 
    app.get("/payments", async (req, res) => {
      const query = { email: req.params.email }
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    })

    app.post("/payments", async (req, res) => {
      const payment = req.body;
      const paymentResult = await paymentCollection.insertOne(payment);
      console.log("payment info ", payment);
      const query = {
        _id: {
          $in: payment.cartIds.map(id => new ObjectId(id))
        }
      }
      const deleteResult = await MyCartCollection.deleteMany(query);
      res.send({ paymentResult, deleteResult });
    })   

    app.get("/mycart", async (req, res) => {
      const email = req.body.email;
      const query = { email: email };
      const result = await MyCartCollection.find(query).toArray();
      res.send(result);
    });
 
    app.post("/mycart", async (req, res) => {
      const cart = req.body;
      const result = await MyCartCollection.insertOne(cart);
      console.log(result);
      res.send(result);
    });

    app.delete("/mycart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await MyCartCollection.deleteOne(query);
      res.send(result);
    }) 


    // reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    app.get("/reviews/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewsCollection.findOne(query);
      res.send(result);
    });

    app.delete('/reviews/:_id',  async (req, res) => {
      const id = req.params._id;
      const query = { _id: new ObjectId(id) }
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    })
    app.post("/reviews", async (req, res) => {
      const reviewItem = req.body;
      const result = await reviewsCollection.insertOne(reviewItem);
      res.send(result);
    }); 

   
    // New route to get cart by email
    app.get("/mycart/:email", async (req, res) => {
      const userEmail = req.params.email;
      const result = await MyCartCollection.find().toArray();
      const userCart = result.filter((item) => item.email === userEmail);
      res.json(userCart);
    });

    // Booking APIs
    // READ Bookings
    app.get("/bookings", async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.send(result);
    });
    // POST Bookings
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      console.log(result);
      res.send(result);
    });

    // READ Booking Data by ID
    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.findOne(query);
      res.send(result);
    });
    // PATCH Accepting Bookings

    app.patch("/bookings/accept/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "Accepted",
        },
      };
      const result = await bookingCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    // PATCH Rejecting Bookings
    app.patch("/bookings/reject/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "Rejected",
        },
      };
      const result = await bookingCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });


    // _____________________________________________________
    //  Retrieve the pending sales data for pets.
    app.get("/mypet", async (req, res) => {
      const result = await petCollection.find({ status: 'pending' }).toArray();
      res.send(result);
    });

    // get all pending sales data by a particular email.
    app.get("/mypet/:email", async (req, res) => {
      const email = req.params.email;
      const query = { owner_email: email }
      const result = await petCollection.find(query).toArray();
      res.json(result);
    });

    // get a pending sell data by a unique Id.
    app.get("/myallpet/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await petCollection.findOne(query);
      res.send(result);
    });

    // post a data for pet sell.
    app.post("/mypet", async (req, res) => {
      const mypet = req.body;
      const result = await petCollection.insertOne(mypet);
      console.log(result);
      res.send(result);
    });

    // Update details for sells pet.
    app.put('/myallpet/:id', async (req, res) => {
      const id = req.params.id
      const updateddetails = req.body
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updateddetails.name,
          image: updateddetails.image,
          gender: updateddetails.gender,
          age: updateddetails.age,
          adoption_fee: updateddetails.adoption_fee,
          species: updateddetails.species,
          color: updateddetails.color,
          breed: updateddetails.breed,
          available: updateddetails.available,
          description: updateddetails.description,
        },
      };
      const result = await petCollection.updateOne(filter, updateDoc, options);
      res.send(result)
    })

    //Delete a data by id.
    app.delete('/mypet/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await petCollection.deleteOne(query);
      res.send(result)
    })


    // _____________________________________________________
    

    app.post("/seller", async (req, res) => {
      const sellerInfo = req.body;
      console.log(sellerInfo);
      const result = await sellerCollection.insertOne(sellerInfo);
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
