const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const app = express();
const upload = multer();

// Crea la cartella tmp se non esiste
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}

app.use(upload.array()); 
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/create-ticket', (req, res) => {
    console.log("Dati ricevuti dal form:", req.body);
    const { name, idCode } = req.body;

    const doc = new PDFDocument();
    const pdfPath = path.join(tmpDir, `ticket-${Date.now()}.pdf`);
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    const layoutImagePath = path.join(__dirname, 'public', 'biglietto.png');
    doc.image(layoutImagePath, 0, 0, { width: 595 });
    doc.fillColor('white').fontSize(8);
    
    doc.fontSize(12).text(`${name}`, 50, 110);
    doc.fontSize(12).text(`ID: ${idCode}`, 50, 150);

    doc.end();

    stream.on('finish', () => {
        res.download(pdfPath, 'biglietto.pdf', (err) => {
            if (!err) {
                fs.unlink(pdfPath, (unlinkErr) => {
                    if (unlinkErr) console.error(unlinkErr);
                });
            } else {
                console.error(err);
            }
        });
    });

    stream.on('error', (streamError) => {
        console.error('Errore nel Stream:', streamError);
        res.status(500).send('Errore interno del server');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});
