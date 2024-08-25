// const express = require("express");
// const multer = require("multer");
// const fs = require("fs");
// const { v4: uuidv4 } = require("uuid");
// const { promisify } = require("util");

// const pipeline = promisify(require("stream").pipeline);

// const router = express.Router();

// const upload = multer();

// router.post("/resume", upload.single("file"), (req, res) => {
//   const { file } = req;
//   if (file.detectedFileExtension != ".pdf") {
//     res.status(400).json({
//       message: "Invalid format",
//     });
//   } else {
//     const filename = `${uuidv4()}${file.detectedFileExtension}`;

//     pipeline(
//       file.stream,
//       fs.createWriteStream(`${__dirname}/../public/resume/${filename}`)
//     )
//       .then(() => {
//         res.send({
//           message: "File uploaded successfully",
//           url: `/host/resume/${filename}`,
//         });
//       })
//       .catch((err) => {
//         res.status(400).json({
//           message: "Error while uploading",
//         });
//       });
//   }
// });

// router.post("/profile", upload.single("file"), (req, res) => {
//   const { file } = req;
//   if (
//     file.detectedFileExtension != ".jpg" &&
//     file.detectedFileExtension != ".png"
//   ) {
//     res.status(400).json({
//       message: "Invalid format",
//     });
//   } else {
//     const filename = `${uuidv4()}${file.detectedFileExtension}`;

//     pipeline(
//       file.stream,
//       fs.createWriteStream(`${__dirname}/../public/profile/${filename}`)
//     )
//       .then(() => {
//         res.send({
//           message: "Profile image uploaded successfully",
//           url: `/host/profile/${filename}`,
//         });
//       })
//       .catch((err) => {
//         res.status(400).json({
//           message: "Error while uploading",
//         });
//       });
//   }
// });

// module.exports = router;
// const express = require("express");
// const multer = require("multer");
// const fs = require("fs").promises; // Use promises for cleaner async/await syntax
// const { v4: uuidv4 } = require("uuid");
// //const path = require('path');
// const router = express.Router();
// const directoryPath = './myNewDirectory';

// fs.mkdir(directoryPath, { recursive: true }, (err) => {
//   if (err) {
//     console.error('Error creating directory:', err);
//   } else {
//     console.log('Directory created successfully!');
//   }
// });
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
    
//     const uploadDir = req.path.split("/")[1]; // Extract directory name from path
//     fs.mkdir(`${__dirname}/../public/${uploadDir}`, { recursive: true })
//       .then(() => cb(null, `${__dirname}/../public/${uploadDir}`))
//       .catch((err) => cb(err, null));
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `${uuidv4()}${ext}`);
//   },
// });

// const upload = multer({ storage }); // Use the configured storage

// const allowedExtensions = [".pdf", ".jpg", ".png"]; // Define allowed extensions

// router.post("/resume", upload.single("file"), async (req, res) => {
//   try {
//     const { file } = req;

//     if (!allowedExtensions.includes(file.detectedFileExtension)) {
//       throw new Error("Invalid format"); // Throw specific error for clarity
//     }

//     await fs.writeFile(`${__dirname}/../public/resume/${file.filename}`, file.buffer); // Use writeFile with buffer for efficiency

//     res.send({
//       message: "File uploaded successfully",
//       url: `/host/resume/${file.filename}`,
//     });
//   } catch (err) {
//     console.error(err); // Log errors for debugging
//     res.status(400).json({ message: "Invalid format or error while uploading" });
//   }
// });

// router.post("/profile", upload.single("file"), async (req, res) => {
//   try {
//     const { file } = req;

//     if (!allowedExtensions.includes(file.detectedFileExtension)) {
//       throw new Error("Invalid format");
//     }

//     await fs.writeFile(`${__dirname}/../public/profile/${file.filename}`, file.buffer);

//     res.send({
//       message: "Profile image uploaded successfully",
//       url: `/host/profile/${file.filename}`,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ message: "Invalid format or error while uploading" });
//   }
// });

// module.exports = router;


const express = require("express");
const multer = require("multer");
const fs = require("fs").promises; // Use promises for cleaner async/await syntax
const { v4: uuidv4 } = require("uuid");
const path = require("path"); // Make sure to include path
const router = express.Router();

const directoryPath = path.join(__dirname, "../public");

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`Directory created successfully at ${dirPath}`);
  } catch (err) {
    console.error('Error creating directory:', err);
  }
}

// Ensure directories are created at startup
ensureDirectoryExists(path.join(directoryPath, 'resume'));
ensureDirectoryExists(path.join(directoryPath, 'profile'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = req.path.split("/")[1]; // Extract directory name from path
    const uploadPath = path.join(directoryPath, uploadDir);
    ensureDirectoryExists(uploadPath).then(() => cb(null, uploadPath)).catch((err) => cb(err));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({ storage });

const allowedExtensions = [".pdf", ".jpg", ".png"]; // Define allowed extensions

router.post("/resume", upload.single("file"), async (req, res) => {
  try {
    const { file } = req;

    if (!file) {
      throw new Error("No file uploaded");
    }

    const ext = path.extname(file.originalname);
    if (!allowedExtensions.includes(ext)) {
      throw new Error("Invalid format");
    }

    const filePath = path.join(directoryPath, 'resume', file.filename);
    await fs.writeFile(filePath, file.buffer); // Use writeFile with buffer for efficiency

    res.send({
      message: "File uploaded successfully",
      url: `/host/resume/${file.filename}`,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid format or error while uploading" });
  }
});

router.post("/profile", upload.single("file"), async (req, res) => {
  try {
    const { file } = req;

    if (!file) {
      throw new Error("No file uploaded");
    }

    const ext = path.extname(file.originalname);
    if (!allowedExtensions.includes(ext)) {
      throw new Error("Invalid format");
    }

    const filePath = path.join(directoryPath, 'profile', file.filename);
    await fs.writeFile(filePath, file.buffer);

    res.send({
      message: "Profile image uploaded successfully",
      url: `/host/profile/${file.filename}`,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid format or error while uploading" });
  }
});

module.exports = router;
