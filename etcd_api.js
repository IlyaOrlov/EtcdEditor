// TODO throw exception if status of operation unsuccessful
const fs = require('fs');

const { Etcd3 } = require('etcd3');
const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "X-Etcd-Cluster-Id": "7e27652122e8b2ae",
    "X-Etcd-Index": 0,
    'X-Raft-Index': 0,
    'X-Raft-Term': 0
};

const etcdClient = new Etcd3({
    credentials: {
        rootCertificate: fs.readFileSync(__dirname + 'cert_example/etcd-root-ca.pem'),
        certChain: fs.readFileSync(__dirname + 'cert_example/client.pem'),
        privateKey: fs.readFileSync(__dirname + 'cert_example/client-key.pem')
    },
});

async function getAll() {
    let kvs = await etcdClient.getAll().all();
    let nodes = [];
    for (let idx in kvs) {
        let key =  {
            "key": idx,
            "value": kvs[idx],
            "modifiedIndex": 0,
            "createdIndex": 0
        };
        nodes.push(key);
    }
    let res = {
        "action": "get",
        "node": {
            "key": "",
            "dir": true,
            "nodes": nodes
        }
    };
    return res;
}


async function get({ options, key }) {
    let val = await etcdClient.get(key).string();
    let res = {
        "action": "get",
        "node": {
            "key": key,
            "value": val,
            "modifiedIndex": 0,
            "createdIndex": 0
        }
    };
    return res;
}

async function put({ key, val }) {
    let status = await etcdClient.put(key).value(val);
    let res = {
        "action": "set",
        "node": {
            "key": key,
            "value": val,
            "modifiedIndex": 0,
            "createdIndex": 0
        }
    };
    return res;
}

async function del({ key }) {
    let status = await etcdClient.delete().key(key);
    let res = {
        "action": "delete",
        "node": {
            "key": key
        },
        "prevNode": {
            "key": key
        }
    };
    return res;
}

module.exports = {
    getAll: getAll,
    get: get,
    put: put,
    del: del
};