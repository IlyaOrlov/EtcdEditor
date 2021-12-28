const url = require('url');
const path = require('path');
const fs = require('fs');
const http = require('http');
const conf = require('./utils/config');
const etcdApi = require('./etcd_api');

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
    auth = new Buffer(auth, 'base64').toString();
    auth = auth.match(/^([^:]*):(.*)$/);
    if (!auth) return false;

    return (auth[1] === authUser && auth[2] === authPass)
}

// redirect requests to etcd-server
function proxy(client_req, client_res) {
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
        const regex = /\/.*\/keys\/(.*)\?value=(.*)/;
        const match = regex.exec(client_req.url);
        if (match) {
            etcdApi.put(opts, match[1], match[2], client_res);
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


// view-server
http.createServer(function serverFile(req, res) {
    // authentication
    if (!auth(req, res)) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
        res.end('Unauthorized');
        return;
    }

    if (req.url === '/') {
        req.url = '/index.html';
    } else if (req.url.substr(0, 3) === '/v2') {
        // avoid fileExists for /v2 routes
        return proxy(req, res);
    }

    const uri = url.parse(req.url).pathname;
    const filename = path.join(process.cwd(), publicDir, uri);

    fs.exists(filename, function (exists) {
        // proxy if file does not exist
        if (!exists) return proxy(req, res);

        // serve static file if exists
        res.writeHead(200, MIME_TYPES[path.extname(filename).split(".")[1]]);
        fs.createReadStream(filename).pipe(res);
    });
}).listen(serverPort, function () {
    console.log(`proxy /api requests to etcd on ${etcdHost}:${etcdPort}`);
    console.log(`etc_viewer listening on port ${serverPort}`);
});
