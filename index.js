const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.soawu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        await client.connect();

        const coffeeCollection = client.db("coffeeDB").collection("coffees");

        app.post("/coffees", async (req, res) => {
            const newCoffee = req.body;
            console.log(newCoffee);
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);
        });

        app.get("/coffees", async (req, res) => {
            const collections = coffeeCollection.find();
            const result = await collections.toArray();
            res.send(result);
        });

        app.delete("/coffees/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        });

        app.get("/coffees/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        });

        app.put("/coffees/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const prevCoffee = req.body;
            const options = { upsert: true };
            const updatedCoffee = {
                $set: {
                    name: prevCoffee.name,
                    chef: prevCoffee.chef,
                    supplier: prevCoffee.supplier,
                    taste: prevCoffee.taste,
                    category: prevCoffee.category,
                    details: prevCoffee.details,
                    photo: prevCoffee.photo,
                },
            };
            const result = await coffeeCollection.updateOne(
                filter,
                updatedCoffee,
                options
            );
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
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
    res.send("Coffee store server is running properly.");
});

app.listen(port, () => {
    console.log(`Coffee store server is running on port: ${port}`);
});
