const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express()
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fgjem.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
            return res.status(401).send({ message: 'UnAuthorized access' });
      }
      const token = authHeader.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
            if (err) {
                  return res.status(403).send({ message: 'Forbidden access' })
            }
            req.decoded = decoded;
            next();
      });
}

async function run() {
      try {
            await client.connect();
            const toolCollection = client.db('bicycle_hand').collection('tools');
            const userCollection = client.db('bicycle_hand').collection('users');
            const reviewCollection = client.db('bicycle_hand').collection('reviews');

            const infoCollection = client.db('bicycle_hand').collection('information');



            app.get('/tools', async (req, res) => {
                  const query = {};
                  const cursor = toolCollection.find(query);
                  const tools = await cursor.toArray();
                  res.send(tools);
            })

            app.get('/user', verifyJWT, async (req, res) => {
                  const users = await userCollection.find().toArray();
                  res.send(users);
            });

            app.put('/user/admin/:email', verifyJWT, async (req, res) => {
                  const email = req.params.email;
                  const requester = req.decoded.email;
                  const requesterAccount = await userCollection.findOne({ email: requester });
                  if (requesterAccount.role === 'admin') {
                        const filter = { email: email };

                        const updateDoc = {
                              $set: { role: 'admin' },
                        };
                        const result = await userCollection.updateOne(filter, updateDoc);
                        res.send(result);

                  }
                  else {
                        res.status(403).send({ message: forbidden });
                  }




            })

            app.get('/admin/:email', async (req, res) => {
                  const email = req.params.email;
                  const user = await userCollection.findOne({ email: email });
                  const isAdmin = user?.role === 'admin';
                  res.send({ admin: isAdmin })
            })

            app.get('/addReview', async (req, res) => {
                  const query = {};
                  const cursor = reviewCollection.find(query);
                  const reviews = await cursor.toArray();
                  res.send(reviews);
            })
            app.post('/addReview', async (req, res) => {
                  const newItem = req.body;
                  const result = await reviewCollection.insertOne(newItem);
                  res.send(result);
            })
            app.post('/information', async (req, res) => {
                  const newItem = req.body;
                  const result = await infoCollection.insertOne(newItem);
                  res.send(result);
            })
            app.post('/addProduct', async (req, res) => {
                  const newItem = req.body;
                  const result = await toolCollection.insertOne(newItem);
                  res.send(result);
            })
            app.get('/tools/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: ObjectId(id) }
                  const tool = await toolCollection.findOne(query);
                  res.send(tool)
            })
            app.put('/user/:email', async (req, res) => {
                  const email = req.params.email;
                  const user = req.body;
                  const filter = { email: email };
                  const options = { upsert: true };
                  const updateDoc = {
                        $set: user,
                  };
                  const result = await userCollection.updateOne(filter, updateDoc, options);
                  const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
                  res.send({ result, token });
            })


      }
      finally {

      }
}
run().catch(console.dir);

app.get('/', (req, res) => {
      res.send('Hello Bicycle hand!')
})

app.listen(port, () => {
      console.log(`bicycle app listening on port ${port}`)
})