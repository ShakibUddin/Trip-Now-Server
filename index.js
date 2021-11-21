const express = require("express");
const cors = require("cors");
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express();

// middlewares
app.use(cors());
app.use(express.json());

//database url
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@main.vzl7z.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const port = process.env.PORT || 5000;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db(process.env.DB_NAME);
        const tripsCollection = database.collection('trips');
        const hotelsCollection = database.collection('hotels');
        const bookingsCollection = database.collection('bookings');
        const popularPlacesCollection = database.collection('popularplaces');
        const usersCollection = database.collection('users');

        // GET API - get all trips
        app.get('/trips', async (req, res) => {
            const cursor = tripsCollection.find({});
            const trips = await cursor.toArray();
            res.send(trips);
        });
        // GET API - get all hotels
        app.get('/hotels', async (req, res) => {
            const cursor = hotelsCollection.find({});
            const hotels = await cursor.toArray();
            res.send(hotels);
        });
        // GET API - get all bookings
        app.get('/allbookings', async (req, res) => {
            const cursor = bookingsCollection.find({});
            const allBookings = await cursor.toArray();
            res.send(allBookings);
        });
        // GET API - get all popular places
        app.get('/popularplaces', async (req, res) => {
            const cursor = popularPlacesCollection.find({});
            const popularplaces = await cursor.toArray();
            res.send(popularplaces);
        });
        // GET API - check if user is admin
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            console.log(user)
            if (user.role === "ADMIN") {
                res.send(true);
            }
            {
                res.send(false);
            }
        });
        // POST API - add a user in db
        app.put('/user/add', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const update = { $set: user };
            const options = { upsert: true };
            const upsertOperation = await usersCollection.updateOne(query, update, options);
            if (upsertOperation.acknowledged) {
                res.send(true);
            }
            else {
                res.send(false);
            }
        });
        // POST API - post a booking from user
        app.post('/booking', async (req, res) => {
            const data = req.body;
            const insertOperation = await bookingsCollection.insertOne(data);
            if (insertOperation.acknowledged) {
                res.send(true);
            }
            else {
                res.send(false);
            }
        });
        // DELETE API - delete a booking
        app.delete('/delete/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleteOperation = await bookingsCollection.deleteOne(query);
            if (deleteOperation.acknowledged) {
                res.send(true);
            }
            else {
                res.send(false);
            }
        })
        // PUT API - update a booking status
        app.put('/update/booking/:id', async (req, res) => {
            // create a filter for a booking to update
            const filter = { '_id': ObjectId(req.params.id) };
            // create a document that sets the approved value of booking
            const updateDoc = {
                $set: {
                    status: "Approved"
                },
            };
            const updateOperation = await bookingsCollection.updateOne(filter, updateDoc);
            if (updateOperation.acknowledged) {
                res.send(true);
            }
            else {
                res.send(false);
            }
        })
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Book your trips now!");
})
app.listen(port, () => {
    console.log("listening to", port);
});