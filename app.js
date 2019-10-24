const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');
const config = require('config');
const crypto = require('crypto');

function getRandomHash() {
    const current_date = (new Date()).valueOf().toString();
    const random = Math.random().toString();
    return (crypto.createHash('sha1').update(current_date + random).digest('hex'));
}

const serverId = getRandomHash();
const getJsonResponse = require('./src/helper/json-response');

let elasticLink = process.env.ELASTICSEARCH || config.elasticsearch;

let bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb', extended: true, type: 'application/json'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, type: 'application/json'}));
app.use(cors());

app.get('/', (req, res) => {
    res.json({
        serverId: serverId,
        service: "wi-logs"
    })
});

app.post('/search', (req, res) => {
    let obj = {};
    let eLink = elasticLink;
    if (req.body.index) {
        eLink = elasticLink + '/' + req.body.index + '/_search';
    } else {
        res.status(512).json(getJsonResponse(512, 'Require index field in request', {}));
        return;
    }
    if (req.body.match) {
        obj = {
            query: {
                bool: {
                    must: [
                        {term: req.body.match}
                    ]
                }
            }
        }
        if (req.body.time) {
            let rangeQuery = {
                range: {
                    timestamp: {
                        gte: "now-" + req.body.time.last
                    }
                }
            }
            obj.query.bool.must.push(rangeQuery);
        }
        if (req.body.fulltext) {
            let match = {
                match: fulltext
            }
            obj.query.bool.must.push(match);
        }
        axios.get(eLink, obj)
            .then((rs) => {
                rs = rs.data;
                if (rs.hits) {
                    res.status(200).json(getJsonResponse(200, 'successfully', rs.hits));
                } else {
                    res.status(512).json(getJsonResponse(512, 'Require match field in request', {}));
                }
            })
    } else {
        res.status(512).json(getJsonResponse(512, 'Require match field in request', {}));
    }
});

let port = process.env.APP_PORT || config.app.port;

app.listen(port, () => {
    console.log("App listening in port:", port);
    console.log("ENV = ", process.env.NODE_ENV);
});

// const amqp = require('amqplib');

// var q = 'wi_backend_log';

// var open = amqp.connect('amqp://test_comsumer:123456@192.168.0.87:5672');

// open.then(function(conn) {
//   return conn.createChannel();
// }).then(function(ch) {
//   return ch.assertQueue(q, {durable: true}).then(function(ok) {
//     return ch.consume(q, async function(msg) {
//       if (msg !== null) {
//         console.log(JSON.parse(msg.content.toString()));
//         ch.ack(msg);
//       }
//     });
//   });
// }).catch(console.warn);

// const ELASTICSEARCH = 'http://192.168.0.87:9200';

// const { Client } = require('@elastic/elasticsearch');
// const client = new Client({ node: ELASTICSEARCH });

// const Consumer = require('./src/Consumer');

// let consumer = new Consumer({
//     host: '192.168.0.87'
// }, saveMessageBackend);


// function saveMessageBackend(msg) {
//     return new Promise((resolve, reject)=>{
//         let message = JSON.parse(msg.content.toString());
//         console.log(message);
//         resolve(null);
//     });
// }