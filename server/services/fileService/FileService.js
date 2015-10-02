import * as localClient from './localClient';

let client;
try {
  let extensions = require('research-extensions');
  client = extensions.client ? extensions.client : localClient;
}
catch (err) {
  client = localClient;
}


export function getFile(key, callback) {
  return client.getFile(key, callback);
}

export function deleteFile(key, callback) {
  client.deleteFile(key, callback);
}

