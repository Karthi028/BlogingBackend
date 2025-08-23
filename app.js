const express = require('express');
const Authrouter = require('./routers/authrouter');

const app = express();

app.use(express.json());

app.use('/api/v1/auth',Authrouter)

app.use((req,res,next)=>{
    res.json({message:"No routes found"});
})

module.exports = app;