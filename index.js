const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.port || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fwbvrwr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // Collection data API
    const usersCollection = client.db("learnHub").collection("users");
    const instructorCollection = client.db("learnHub").collection("instructor");
    const cartCollection = client.db("learnHub").collection("carts");

     // users related apis
     app.get('/users', async (req, res) => {
      const user = req.body;
      console.log(user)
      const result = await usersCollection.find().toArray();
      res.send(result)
    });

    //User for manually and social login
     app.post('/users', async (req, res) => {
      const user = req.body;
      console.log(user)
      const query = {email:user.email}
      const existingUser = await usersCollection.findOne(query);
      if (existingUser){
        return res.send ({massage: 'user already exists'})
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //For the Make Admin
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
    
      const query = { email: email }
      const user = await usersCollection.findOne(query);
      const result = { admin: user && user.role === 'admin' } // Add a check for user existence and role property
      res.send(result);
    })


    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };
    
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    })
    
    // for the make instructor

    app.get('/users/instructor/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = await usersCollection.findOne(query);
      const result = { instructor: user && user.role === 'instructor' } 
      res.send(result);
    });
    
    app.patch('/users/instructor/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'instructor'
        },
      };
      
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.delete('/users/instructor/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });
    
    // instructor data API
    app.get('/instructor', async(req, res) => {
      const result = await instructorCollection.find().toArray();
      res.send(result); 
    });
    
    // for the post classes 
    app.post('/classes', async (req, res) => {
        const classData = req.body; 
        const result= await instructorCollection.insertOne(classData);
        res.send(result);
    });
    
  

    app.get('/instructor/:email', async (req, res) => {
      const email = req.params.email;
      console.log('I wanna see data for email:', email);
      const query = { email: email };
      const result = await instructorCollection.findOne(query);
      res.json(result);
    });

     //query by email
 
     app.get('/classes', async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await instructorCollection.find(query).toArray();
      res.send(result);
    });
    
    // Delete my classes
    app.delete("/classes/:id", async (req, res) => {
      console.log(req.params);
      const result = await instructorCollection.deleteOne({ 
        _id: new ObjectId(req.params.id), });
        res.send(result);
    });


     // cart collection apis
     app.get('/carts', async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/carts', async (req, res) => {
      const item = req.body;
      console.log(item);
      const result = await cartCollection.insertOne(item);
      res.send(result);
    })

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })
    
 

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/',(req ,res)=> {
    res.send('Learn hub is running')
})

app.listen(port,()=> {
    console.log (`Learn hub is running on port ${port}`)
})