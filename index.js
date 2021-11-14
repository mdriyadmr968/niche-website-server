const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5rfsc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("carsDB");

    const carsCollection = database.collection("cars");

    const purchasedCarsCollection = database.collection("purchasedCars");

    const reviewsCollection = database.collection("reviews");

    const usersCollection = database.collection("users");
    console.log("connected");
    // Get all cars data from database
    app.get("/allCars", async (req, res) => {
      const cursor = carsCollection.find({});
      const result = await cursor.toArray();

      res.send(result);
    });
    // Manage  product ,  Delete Specific Cars from Manage product
    app.delete("/allCars/:carsId", async (req, res) => {
      console.log("hitted");
      const query = {
        _id: ObjectId(req.params.carsId),
      };
      console.log(req.params.carsId);
      const result = await carsCollection.deleteOne(query);

      res.json(result);
    });

    // Inserting Purchased Car in the database
    app.post("/purchasedCars", async (req, res) => {
      const purchasedCarsData = req.body;

      const userResult = await purchasedCarsCollection.insertOne(
        purchasedCarsData
      );
      res.json(userResult);
    });

    // Getting all the purchased car of the specific user from the database via email in My Orders
    app.get("/myOrders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: `${email}` };
      const result = await purchasedCarsCollection.find(query).toArray();
      res.send(result);
      console.log(result);
    });
    // Delete specific car from MyOrders
    app.delete("/deleteCar/:carId", async (req, res) => {
      const query = {
        _id: ObjectId(req.params.carId),
      };

      const result = await purchasedCarsCollection.deleteOne(query);

      res.json(result);
      console.log(result);
    });
    //Post a review into the database
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);

      res.json(result);
    });

    //Get all the reviews from the database

    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const result = await cursor.toArray();

      res.send(result);
    });

    //getting all the admins from the database

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //Post a user to the database from email and password sign in

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    //post a user to the database from the google login by google auth provider

    app.put("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log(result);
      res.json(result);
    });

    //making a user admin

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      console.log("put", user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // Manage All Orders Get Api

    app.get("/manageAllOrders", async (req, res) => {
      const cursor = purchasedCarsCollection.find({});
      const result = await cursor.toArray();

      res.send(result);
    });

    // Manage All Orders , Delete specific purchased

    app.delete("/deletePurchasedCars/:purchasedId", async (req, res) => {
      const query = {
        _id: ObjectId(req.params.purchasedId),
      };

      const result = await purchasedCarsCollection.deleteOne(query);

      res.json(result);
    });

    // Update status Pending to Shipped
    app.put("/updateStatus/:statusId", async (req, res) => {
      const query = {
        _id: ObjectId(req.params.statusId),
      };
      const filter = query;
      // const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: `Shipped`,
        },
      };
      const result = await purchasedCarsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Add  product / more Cars to  the Explore page

    app.post("/addProduct", async (req, res) => {
      const addCars = req.body;
      const carsResult = await carsCollection.insertOne(addCars);

      res.json(carsResult);
    });

    // Manage Product where get all the data
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello car!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
