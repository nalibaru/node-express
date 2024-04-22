const express = require('express');
const cors = require('cors'); 
const multer = require('multer');
const fs = require('fs');

require('dotenv').config();
const port = process.env.PORT || 3001;
const serve = "http://localhost:3001/public/images/";
const { PDFDocument } = require('pdf-lib');
const bodyParser = require('body-parser');
const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/public', express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images'); 
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
    const filename = req.file.filename;
    const url = serve+filename;
    res.json({url:url, filename: filename, message: 'Successfully uploaded file' });
  });

  app.post('/filepdfupload', upload.single('pdf'), (req, res) => {
    if (req.file) { 
      let filename = req.file.filename;
      const additionalDetails = req.body.details;
      const url = serve +filename;
      res.json({ url: url, filename: filename, details:additionalDetails, message: 'Successfully uploaded file' });
    } else {
      res.status(400).json({ message: 'No file uploaded' });
    }
  });

  app.post('/edit-pdf', async (req, res) => {
    const { text, x, y, size, filename,currentPage} = req.body; 
    try {
      const filePath = './public/images/' + filename;
      const existingPdfBytes = fs.readFileSync(filePath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const currentPageNo = currentPage - 1 || 0;
      const firstPage = pages[currentPageNo];
      firstPage.drawText(text, { x, y, size });
  
      const pdfBytes = await pdfDoc.save();
     
      fs.writeFileSync(filePath, pdfBytes);
      res.json({ message: 'PDF updated successfully', filename });
     
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  });
  

const userRoutes = require('./routes/userRoutes');
const timeRoutes = require('./routes/timeRoutes');

// Use route middleware
app.use('/api/users', userRoutes);
app.use('/api/timetable', timeRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});