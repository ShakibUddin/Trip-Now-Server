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

        // GET API
        app.get('/trips', async (req, res) => {
            const cursor = tripsCollection.find({});
            const trips = await cursor.toArray();
            res.send(trips);
        });
        // GET API
        app.get('/hotels', async (req, res) => {
            const cursor = hotelsCollection.find({});
            const hotels = await cursor.toArray();
            res.send(hotels);
        });
        // GET API
        app.get('/allbookings', async (req, res) => {
            const cursor = bookingsCollection.find({});
            const allBookings = await cursor.toArray();
            res.send(allBookings);
        });
        // POST API
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
        // DELETE API
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