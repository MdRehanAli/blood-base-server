const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mrcc0jp.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send("Server is Running.....");
})


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const db = client.db("bloodBaseDB");
        const usersCollection = db.collection("users");
        const eventsCollection = db.collection("events");
        const joinEventCollection = db.collection("joinEvent")

        // All Api's here 
        // Users Api

        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await usersCollection.findOne(query)
            res.send(result);
        })

        app.get('/users/:email/role', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ role: user?.role || 'user' })
        })

        app.post('/users', async (req, res) => {
            const newUser = req.body;

            newUser.status = 'pending';
            newUser.role = 'user';
            newUser.createdAt = new Date();

            console.log(newUser);

            const query = { email: newUser.email };
            const existingUser = await usersCollection.findOne(query);

            if (existingUser) {
                res.send("User already exist. Do no need to insert again.")
            }
            else {
                const result = await usersCollection.insertOne(newUser);
                res.send(result);
            }
        })

        app.patch('/users/:id/role', async (req, res) => {
            const id = req.params.id;
            const roleInfo = req.body
            const query = { _id: new ObjectId(id) };

            const updateDoc = {
                $set: {
                    role: roleInfo.role
                }
            }

            const result = await usersCollection.updateOne(query, updateDoc);

            res.send(result);
        })


        // Events Api 

        app.get('/events', async (req, res) => {
            const cursor = eventsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/events/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await eventsCollection.findOne(query)
            res.send(result);
        })

        app.post('/events', async (req, res) => {
            const newEvent = req.body;
            const result = await eventsCollection.insertOne(newEvent);
            res.send(result)
        })

        app.patch('/events/:id', async (req, res) => {
            const id = req.params.id;
            const updatedEvent = req.body;

            const query = { _id: new ObjectId(id) };
            const update = {
                $set: {
                    title: updatedEvent.title,
                    description: updatedEvent.description,
                    type: updatedEvent.type,
                    thumbnail: updatedEvent.thumbnail,
                    location: updatedEvent.location,
                    eventDate: updatedEvent.eventDate
                }
            }

            const result = await eventsCollection.updateOne(query, update);
            res.send(result);
        })

        app.delete('/events/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await eventsCollection.deleteOne(query);
            res.send(result);
        })


        // Join Event Api 

        app.get('/join-event', async (req, res) => {

            const cursor = joinEventCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/join-event', async (req, res) => {
            const newJoinEvent = req.body;

            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const existingUser = await joinEventCollection.findOne(query);

            if (existingUser) {
                res.send("Joined already exist. Do no need to Join again.")
            }
            else {
                const result = await joinEventCollection.insertOne(newJoinEvent);
                res.send(result);
            }

        })

        app.patch('/join-event/:id', async (req, res) => {
            const id = req.params.id;
            const updatedEvent = req.body;

            const query = { _id: new ObjectId(id) };
            const update = {
                $set: {
                    title: updatedEvent.title,
                    description: updatedEvent.description,
                    type: updatedEvent.type,
                    thumbnail: updatedEvent.thumbnail,
                    location: updatedEvent.location,
                    eventDate: updatedEvent.eventDate
                }
            }

            const result = await joinEventCollection.updateOne(query, update);
            res.send(result);
        })

        app.delete('/join-event/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await joinEventCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Server is running on port:`, port);
})