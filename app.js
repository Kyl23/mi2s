import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import fetch, { File, FormData } from 'node-fetch';

const app = express();

app.use(express.urlencoded({ extended: false }));

// Configure Multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Define the directory where you want to save the uploaded files
        const uploadDir = 'uploads';
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Define the filename for the uploaded file
        const filename = `${uuidv4()}.wav`;
        cb(null, filename);
    },
});
const upload = multer({ storage });

app.post("/api/regconization", upload.single('audio'), (req, res) => {
    const { destination, filename } = req.file;
    fs.readFile(path.join(destination, filename), (err, data) => {
        const formData = new FormData();
        formData.append("service_id", "A000");
        formData.append("test_model", "malay_indo_v3.0E");
        formData.append("token", "kaldi");
        formData.append("segment", false);
        formData.append("correction", false);
        formData.append("file", new File([data], 'file'));

        fetch('https://www.taiwanspeech.ilovetogether.com/asr/api', { method: 'POST', body: formData })
            .then(data => data.json())
            .then((data) => {
                const { words_list } = JSON.parse(data);
                const answer = words_list[0].replace(/-/g, '').replace(/ <SPOKEN_NOISE>/g, '').replace(/<SPOKEN_NOISE> /g, '')
                res.send(answer);
                // fs.rm(path.join(destination, filename), (err) => { if (err) console.log(err) });
                console.log(answer);
            })
    })
});

app.use(express.static('../build'));

app.listen(3000);