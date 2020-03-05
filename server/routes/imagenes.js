const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const { verificaToken, verificaTokenImg } = require('../middleware/authentication');

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) =>{
    let tipo = req.params.tipo;
    let img = req.params.img;


    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${ img }`);

    if(fs.existsSync(pathImg)){
        res.sendFile(pathImg);
    } else {
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(noImagePath);
    }



});


module.exports = app;