const express = require('express');
const app = express();

app.set('trust proxy', 1);
app.get('/ping', (req, res)=>{
	res.end('pong');
});

app.listen(8000, ()=> {
	console.log('running');
});