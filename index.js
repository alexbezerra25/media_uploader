const https = require('https');
const http = require('http')
const fs = require('fs');
const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config()


const MODE = process.env.MODE

app = express();
app.use(cors());

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/')
    },
    filename: function (req, file, cb){
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({storage})

app.use(express.static(path.join(__dirname, 'public')))

app.post('/upload', upload.single('file'), (req, res)=>{
    console.log('Bateu na api')
    if(!req.file){
        res.status(400).json({ msg: 'Nenhum arquivo recebido.'})
    }
    if(!req.file.filename){
        res.status(500).json({ msg: 'Houve algum problema ao tentar salvar o arquivo.'})
    }
    const fileUrl = process.env.BASE_URL + '/' + req.file.filename
    res.status(200).json({fileUrl: fileUrl})
})

if(MODE === 'dev'){
    http
    .createServer(app)
    .listen(4000, ()=>{
        console.log('Uploader HTTP is ronning at port 4000')
    })
}else{

    https
    .createServer(app)
    .listen(4000, ()=>{
        console.log('Uploader HTTPS is ronning at port 4000')
    })
}







