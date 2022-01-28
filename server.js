const url = require('url');
const path = require('path');
const fs = require('fs');
const http = require('http');
const conf = require('./utils/config');
const etcdApi = require('./etcd_api');
const express = require('express');
const bodyParsed = require('body-parser');
const bodyParser = require('body-parser');

const etcdHost = conf.get('etcdHost') || process.env.ETCD_HOST || '0.0.0.0';
const etcdPort = conf.get('etcdPort') || process.env.ETCD_PORT || 4001;
const serverPort = conf.get('serverPort') || process.env.SERVER_PORT || 8000;
const publicDir = conf.get('publicDir') || 'frontend';
const authUser = conf.get('authUser') || process.env.AUTH_USER || '';
const authPass = conf.get('authPass') || process.env.AUTH_PASS || '';

const caFile = conf.get('caFile') || process.env.ETCDCTL_CA_FILE || false;
const keyFile = conf.get('keyFile') || process.env.ETCDCTL_KEY_FILE || false;
const certFile = conf.get('certFile') || process.env.ETCDCTL_CERT_FILE || false;

const MIME_TYPES = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"
};

const app = express();

let opts = {
    hostname: etcdHost,
    port: etcdPort,
};

// https/certs support
if (certFile) {
    opts.key = fs.readFileSync(keyFile);
    opts.ca = fs.readFileSync(caFile);
    opts.cert = fs.readFileSync(certFile);
}


// view-server authentication
function auth(req, res) {
    if (!authUser) return true;

    let auth = req.headers.authorization;
    if (!auth) return false;

    // malformed
    const parts = auth.split(' ');
    if (parts[0].toLowerCase() !== 'basic') return false;
    if (!parts[1]) return false;
    auth = parts[1];

    // credentials
    auth = Buffer(auth, 'base64').toString();
    auth = auth.match(/^([^:]*):(.*)$/);
    if (!auth) return false;

    return (auth[1] === authUser && auth[2] === authPass)
}

// redirect requests to etcd-server
async function proxy(client_req, client_res) {
    let opts = {
        hostname: etcdHost,
        port: etcdPort,
        path: client_req.url,
        method: client_req.method
    };

    // https/certs support
    if (certFile) {
        opts.key = fs.readFileSync(keyFile);
        opts.ca = fs.readFileSync(caFile);
        opts.cert = fs.readFileSync(certFile);
    }

    console.log(client_req.url);
    console.log(client_req.method);
    if (client_req.method === 'GET') {
        const regex = /\/.*\/keys\/$/;
        if (regex.test(client_req.url)) {
            etcdApi.getAll(opts, client_res);
        } else {
            const regex = /\/.*\/keys\/(.*)/;
            const match = regex.exec(client_req.url);
            if (match) {
                etcdApi.get(opts, match[1], client_res);
            }
        }
    } else if (client_req.method === 'PUT') {
        const regex = /\/.*\/keys\/(.*)/;
        const match = regex.exec(client_req.url);
        if (match) {
            const buffers = [];
            for await (const chunk of client_req) {
                buffers.push(chunk);
              }
            const dataBuffer = Buffer.concat(buffers).toString();

            const data = JSON.parse(dataBuffer);
            etcdApi.put(opts, match[1], JSON.stringify(data.value), client_res);
            // client_req.on('data', chunk => {
            //     console.log(match[1])
            //     console.log(chunk)
            //     etcdApi.put(opts, match[1], chunk.data || '', client_res);
            // })
        }
    } else if (client_req.method === 'DELETE') {
         const regex = /\/.*\/keys\/(.*)/;
         const match = regex.exec(client_req.url);
         if (match) {
              etcdApi.del(opts, match[1], client_res);
         }
    }
    // Old etcdv2 processing
    // client_req.pipe(requester(opts, function(res) {
    //     // if etcd returns that the requested    page has been moved
    //     // to a different location, indicates that the node we are
    //     // querying is not the leader. This will redo the request
    //     // on the leader which is reported by the Location header
    //     if (res.statusCode === 307) {
    //         opts.hostname = url.parse(res.headers['location']).hostname;
    //         client_req.pipe(requester(opts, function(res) {
    //             console.log(`Got response: ${res.statusCode}`);
    //             res.pipe(client_res, {end: true});
    //         }, {end: true}));
    //     } else {
    //         res.pipe(client_res, {end: true});
    //     }
    // }, {end: true}));
}


// requester for communication with etcd-server
let requester = http.request;
if (certFile) {
    // use https requests if theres a cert file
    let https = require('https');
    requester = https.request;

    if (!fs.existsSync(certFile)) {
        console.error('CERT FILE', certFile, 'not found!');
        process.exit(1);
    }
    if (!fs.existsSync(keyFile)) {
        console.error('KEY FILE', keyFile, 'not found!');
        process.exit(1);
    }
    if (!fs.existsSync(caFile)) {
        console.error('CA FILE', caFile, 'not found!');
        process.exit(1);
    }
}

app.use((request, response, next) => {
    if (!auth(request, response)) {
        response.statusCode = 401;
        response.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
        response.end('Unauthorized');
        return;
    }
    next();
});

app.use(express.static(publicDir, {
    extensions: Object.keys(MIME_TYPES),
}));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', async (request, response) => {

});

app.get('/api\/v2/keys', async (request, response) => {
    try {
        const res = await etcdApi.getAll();
        response.status(200).send(res);
    } catch (e) {
        response.status(500).send(`${e}`);
    }
});

app.put(/api\/v2\/keys\/([a-zA-Z0-9_]+)/, async (request, response) => {
    console.log(request.params);
    try {
        const { 0: host } = request.params;
        console.log(host);
        console.log(request.body);
        const res = await etcdApi.put({ key: host, val: JSON.stringify(request.body.value) });
        response.status(200).send(res);
    } catch (e) {
        response.status(500).send(`${e}`);
    }
});

app.listen(serverPort, () => {
    console.log(`proxy /api requests to etcd on ${etcdHost}:${etcdPort}`);
    console.log(`etc_viewer listening on port ${serverPort}`);
});

