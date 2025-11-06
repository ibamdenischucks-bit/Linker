const fs = require('fs');
const path = require('path');
const dataDir = '/tmp/data';
const xpFile = path.join(dataDir, 'xp.json');
const clickedFile = path.join(dataDir, 'clicked.json');

function readJSON(filePath) {
  try { return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : {}; } 
  catch (e) { return {}; }
}

function writeJSON(filePath, data) {
  try { fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); return true; } 
  catch (e) { return false; }
}

exports.handler = async function(event, context) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET, POST' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  
  try {
    if (event.httpMethod === 'GET') {
      return { statusCode: 200, headers, body: JSON.stringify({ xp: readJSON(xpFile), clicked: readJSON(clickedFile) }) };
    } else if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      if (event.path.includes('xp')) {
        const xpData = readJSON(xpFile); xpData[data.username] = data.xp;
        return writeJSON(xpFile, xpData) ? { statusCode: 200, headers, body: JSON.stringify({ success: true }) } : { statusCode: 500, headers, body: JSON.stringify({ error: 'Save failed' }) };
      } else if (event.path.includes('clicked')) {
        const clickedData = readJSON(clickedFile);
        if (!clickedData[data.username]) clickedData[data.username] = [];
        if (!clickedData[data.username].includes(data.targetUser)) clickedData[data.username].push(data.targetUser);
        return writeJSON(clickedFile, clickedData) ? { statusCode: 200, headers, body: JSON.stringify({ success: true }) } : { statusCode: 500, headers, body: JSON.stringify({ error: 'Save failed' }) };
      }
    }
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
  } catch (error) { return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) }; }
};
