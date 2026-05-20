const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    // await client.db("admin").command({ ping: 1 });

    const db = client.db("docAppoint");
    const doctorsCollection = db.collection('doctor');
    const appointmentsCollection = db.collection('appointments');

    app.get('/doctors', async (req, res) => {
        const cursor = doctorsCollection.find();
        const doctors = await cursor.toArray();
        res.send(doctors);
    })

    app.get('/all-appointments/:id' , async (req,res) =>{
      const {id} = req.params;
      console.log(id);
      const query = {_id: new ObjectId(id)};
      const doctor = await doctorsCollection.findOne(query);
      console.log(doctor);
      res.send(doctor);
    })

    app.post('/appointments', async (req, res) => {
      const appointment = req.body;
      const result = await appointmentsCollection.insertOne(appointment);
      res.send(result);
    });

    app.get('/bookings', async (req, res) => {
      const cursor = appointmentsCollection.find();
      const appointments = await cursor.toArray();
      res.send(appointments);
    });

    app.delete('/bookings/:id', async (req, res)=>{
      const {id} = req.params;
      const query = {_id: new ObjectId(id)};
      const result = await appointmentsCollection.deleteOne(query);
      res.send(result);
    })

    app.patch('/bookings/:id', async (req, res)=>{
      const {id} = req.params;
      const modifiedBooking = req.body;
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          name: modifiedBooking.name,
          phone: modifiedBooking.phone,
          date: modifiedBooking.date,
          time: modifiedBooking.time
        },
      };
      const result = await appointmentsCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});