const fs = require('fs');
const path = require('path');
const dataDir = '/tmp/data';
const pendingFile = path.join(dataDir, 'pending.json');
const paidFile = path.join(dataDir, 'paid.json');

function readJSON(filePath) {
  try { return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : []; } 
  catch (e) { return []; }
}

function writeJSON(filePath, data) {
  try { fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); return true; } 
  catch (e) { return false; }
}

exports.handler = async function(event, context) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, DELETE' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  
  try {
    if (event.httpMethod === 'GET') {
      return { statusCode: 200, headers, body: JSON.stringify({ pending: readJSON(pendingFile), paid: readJSON(paidFile) }) };
    } else if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      if (event.path.includes('pending')) {
        const pending = readJSON(pendingFile);
        pending.push({ id: Date.now().toString(), ...data, when: new Date().toISOString() });
        return writeJSON(pendingFile, pending) ? { statusCode: 200, headers, body: JSON.stringify({ success: true }) } : { statusCode: 500, headers, body: JSON.stringify({ error: 'Save failed' }) };
      }
    }
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
  } catch (error) { return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) }; }
};
