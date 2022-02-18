const url = require('url');
const path = require('path');
const fs = require('fs');
const http = require('http');
const conf = require('./utils/config');
const etcdApi = require('./etcd_api');
const express = require('express');
const bodyParser = require('body-parser');

require('./utils/validate_config')();

const serverPort = conf.get('serverPort') || process.env.SERVER_PORT || 8000;

const publicDir = conf.get('publicDir') || 'frontend';

const auth_enabled = config.get('auth:enabled') || process.env.AUTH || false;
const authUser = conf.get('auth:user') || process.env.AUTH_USER || '';
const authPass = conf.get('auth:pass') || process.env.AUTH_PASS || '';

const MIME_TYPES = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"
};

const app = express();

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

app.use(express.static(path.join(__dirname, 'frontend-react', 'build')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'frontend-react', 'build', 'index.html'));
});

app.get('/api\/v2/keys', async (request, response) => {
    try {
        const res = await etcdApi.getAll();
        response.status(200).send(res);
    } catch (e) {
        console.error(e);
        response.status(500).send('Error while processing request');
    }
});

app.put(/api\/v2\/keys\/([a-zA-Z0-9_]+)/, async (request, response) => {
    try {
        const { 0: key } = request.params;
        const res = await etcdApi.put({ key: key, val: JSON.stringify(request.body.value) });
        response.status(200).send(res);
    } catch (e) {
        console.error(e);
        response.status(500).send('Error while processing request');
    }
});

app.delete(/api\/v2\/keys\/([a-zA-Z0-9_]+)/, async (request, response) => {
    try {
        const { 0: key } = request.params;
        const res = await etcdApi.del({ key: key });
        response.status(200).send(res);
    } catch (e) {
        console.error(e);
        response.status(500).send('Error while processing request');
    }
});

app.listen(serverPort, () => {
    console.log(`proxy /api requests to etcd on ${etcdHost}:${etcdPort}`);
    console.log(`etc_viewer listening on port ${serverPort}`);
});

