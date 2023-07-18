require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const url = require('url');
const app = express();
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.DB_URL);
const db = client.db('fcc-url-shortener');
const urls = db.collection('urlObj');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

//Middlewares to get json response from request
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.post('/api/shorturl', (req, res) => {

  const dnsLookUp = dns.lookup(url.parse(req.body.url).hostname, async (err, address) => {

    if (!address) {
      res.json({error: "Invalid URL"});
    } else {

      const urlCount = await urls.countDocuments({});

      const submittedUrl = req.body.url;

      
      const urlObj = {
        original_url: submittedUrl,
        short_url: urlCount
      }

      const result = await urls.insertOne(urlObj);
  
      console.log(result);
      res.json({
        original_url: submittedUrl,
        short_url: urlCount
      });
      
    }
    
  });
  
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
