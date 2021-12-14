const { Etcd3 } = require('etcd3');
const headers = {
    "Content-Type": "application/json",
    "X-Etcd-Cluster-Id": "7e27652122e8b2ae",
    "X-Etcd-Index": 0,
    'X-Raft-Index': 0,
    'X-Raft-Term': 0
};


async function getAll(options, client_res) {
    const etcdClient = new Etcd3();
    let keys = await etcdClient.getAll().keys();
    let nodes = [];

    for (let key_idx in keys) {
        let key =  {
            "key": '/' + keys[key_idx],
            "value": "",
            "modifiedIndex": 0,
            "createdIndex": 0
        };
        nodes.push(key);
    }

    let res = {
        "action": "get",
        "node": {
            "key": "/",
            "dir": true,
            "nodes": nodes
        }
    };
    console.log(JSON.stringify(res));

    client_res.writeHead(200, 'Success', headers);
    client_res.end(JSON.stringify(res));
}


async function get(options, key, client_res) {
    const etcdClient = new Etcd3();
    let val = await etcdClient.get(key).string();

    let res = {
        "action": "get",
        "node": {
            "key": '/' + key,
            "value": val,
            "modifiedIndex": 0,
            "createdIndex": 0
        }
    };
    console.log(JSON.stringify(res));

    client_res.writeHead(200, 'Success', headers);
    client_res.end(JSON.stringify(res));
}

async function put(options, key, val, client_res) {
    const etcdClient = new Etcd3();
    let status = etcdClient.put(key).value(val);
    console.log(status);
    let res = {
        "action": "set",
        "node": {
            "key": '/' + key,
            "value": val,
            "modifiedIndex": 0,
            "createdIndex": 0
        }
    };
    console.log(JSON.stringify(res));

    client_res.writeHead(200, 'Success', headers);
    client_res.end(JSON.stringify(res));
}

async function del(options, key, client_res) {
    const etcdClient = new Etcd3();
    let status = await etcdClient.delete().key(key);
    console.log(status);
    let res = {
        "action": "delete",
        "node": {
            "key": "/" + key
        },
        "prevNode": {
            "key": "/" + key
        }
    };
    console.log(JSON.stringify(res));

    client_res.writeHead(200, 'Success', headers);
    client_res.end(JSON.stringify(res));
}

module.exports = {
    getAll: getAll,
    get: get,
    put: put,
    del: del
};