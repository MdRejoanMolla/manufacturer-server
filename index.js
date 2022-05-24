const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json()); const jwt = require('jsonwebtoken');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fgjem.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
      try {
            await client.connect();
            const toolCollection = client.db('bicycle_hand').collection('tools');

            app.get('/tools', async (req, res) => {
                  const query = {};
                  const cursor = toolCollection.find(query);
                  const tools = await cursor.toArray();
                  res.send(tools);
            })
            app.get('/tools/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: ObjectId(id) }
                  const tool = await toolCollection.findOne(query);
                  res.send(tool)
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