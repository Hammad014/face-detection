const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { exec } = require('child_process');
const { spawn } = require('child_process');
const WebSocket = require('ws'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ensure you have dotenv installed and required

const secretKey = "d42cff2a4314af4155102be2bb4aeb27210301952742fbb2430da2b90cd6fea6"; // Now your secret key is securely loaded

const app = express();
const port = 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://facetrace-pi.vercel.app',
    // 'https://facetrace-git-main-hammad014s-projects.vercel.app',
    // 'https://facetrace-fpfjx7mgy-hammad014s-projects.vercel.app',
    // 'http://13.53.130.198:5000',
    // 'http://ec2-13-53-130-198.eu-north-1.compute.amazonaws.com'
  ],
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/unknowns', express.static(path.join(__dirname, 'unknowns')));

// const wss = new WebSocket.Server({ port: 8080 });

// wss.on('connection', (ws) => {
//   console.log('New client connected');
  
//   ws.on('close', () => {
//     console.log('Client disconnected');
//   });
// });

// // Broadcast function to send message to all connected WebSocket clients
// function broadcastAlert(alert) {
//   console.log('Broadcasting alert:', alert);  // Add this log to confirm broadcasting
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify(alert));
//     }
//   });
// }


// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Use the absolute path here
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });


// MySQL connection
const db = mysql.createConnection({
  host: '13.53.130.198',
  user: 'hammad', // Should match your created user
  password: 'facetraceCOMSIS2172!@', // Verify this is correct
  database: 'personrecognition',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});



app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM Users WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('MySQL error:', err); // Log the error for debugging
      return res.status(500).json({ message: 'Server error' });
    }
    
     
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = results[0];

    // Compare password with hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Bcrypt compare error:', err); // Log bcrypt error
        return res.status(500).json({ message: 'Server error' });
      }
    
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      // Generate a JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role }, // Include role in payload
        secretKey, // Secret key
        { expiresIn: '3h' } // Token expires in 1 hour
      );

      // Check if security questions are set
      const securityQuestionsSet = user.security_question1 && user.security_answer1 && user.security_question2 && user.security_answer2;

      // Send back the token and other data to the frontend
      res.status(200).json({
        message: 'Login successful',
        token,
        securityQuestionsSet,
        role: user.role,
      });
    });
  });
});


// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied' });
  }

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user; // Attach the decoded user to the request object
    next();
  });
};


// Example of protecting a route
app.get('/admin-dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard!' });
});



// Set Security Questions API
app.post('/set-security-questions', authenticateToken, (req, res) => {
  const { question1, answer1, question2, answer2 } = req.body;

  if (!answer1 || !answer2) {
    return res.status(400).json({ message: 'Both answers are required' });
  }

  try {
    // Hash both answers asynchronously
    bcrypt.hash(answer1, 10, (err, hashedAnswer1) => {
      if (err) return res.status(500).json({ message: 'Error saving security answers' });

      bcrypt.hash(answer2, 10, (err, hashedAnswer2) => {
        if (err) return res.status(500).json({ message: 'Error saving security answers' });

        // Prepare the update query to store questions and hashed answers
        const updateQuery = `
          UPDATE Users 
          SET security_question1 = ?, security_answer1 = ?, security_question2 = ?, security_answer2 = ? 
          WHERE id = ?`;

        db.query(updateQuery, [question1, hashedAnswer1, question2, hashedAnswer2, req.user.id], (err, result) => {
          if (err) {
            console.error('Error updating security questions:', err);
            return res.status(500).json({ message: 'Error updating security questions' });
          }

          res.status(200).json({ message: 'Security questions set successfully' });
        });
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ message: 'Unexpected error occurred' });
  }
});



// ====== Nodemailer Transporter ======
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  auth: {
    // Make sure this is your correct Gmail + App Password (no spaces in the password)
    user: 'hammadhl107@gmail.com',
    pass: 'jnax rlgh jhbm zgpj', // Example: remove any spaces
  },
});

// -------------------- Security Questions Recovery (existing) --------------------
app.post('/recover-password', (req, res) => {
  const { username, security_answer1, security_answer2 } = req.body;

  if (!username || !security_answer1 || !security_answer2) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const query = 'SELECT * FROM Users WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = results[0];

    // Compare first security answer
    bcrypt.compare(security_answer1, user.security_answer1, (err, isMatch1) => {
      if (err) {
        console.error('Error comparing first security answer:', err);
        return res.status(500).json({ message: 'Server error.' });
      }
      if (!isMatch1) {
        return res.status(401).json({ message: 'Security answers do not match.' });
      }

      // Compare second security answer
      bcrypt.compare(security_answer2, user.security_answer2, (err, isMatch2) => {
        if (err) {
          console.error('Error comparing second security answer:', err);
          return res.status(500).json({ message: 'Server error.' });
        }
        if (!isMatch2) {
          return res.status(401).json({ message: 'Security answers do not match.' });
        }

        // Both answers matched
        return res.status(200).json({ message: 'Security answers verified.' });
      });
    });
  });
});

// -------------------- Email Recovery (NEW) --------------------
// 1) Send OTP to Email
app.post('/recover-password-email', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  // Check if user with this email exists
  const query = 'SELECT username FROM Users WHERE email = ? LIMIT 1';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No user found with that email.' });
    }

    // We have a user
    // Generate 6-digit OTP as a string
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store this OTP in DB
    const updateQuery = 'UPDATE Users SET reset_otp = ? WHERE email = ?';
    db.query(updateQuery, [otp, email], (updateErr) => {
      if (updateErr) {
        console.error('Error storing OTP in DB:', updateErr);
        return res.status(500).json({ message: 'Server error saving OTP.' });
      }

      const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #4CAF50;">Password Recovery</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your <strong>FaceTrace</strong> account.</p>
        <p style="background-color: #f9f9f9; padding: 10px; border: 1px solid #ccc;">
          <strong>Your One-Time Password (OTP):</strong>
          <span style="color: #e74c3c; font-size: 1.2em;">${otp}</span>
        </p>
        <p>Please use this code to reset your password. It will expire in 15 minutes.</p>
        <hr/>
        <p style="font-size: 0.9em; color: #999;">
          If you didn't request this, please ignore this email or contact support.
        </p>
        <p style="font-size: 0.9em; color: #999;">
          &mdash; The FaceTrace Team
        </p>
      </div>
    `;
    
    // 2) Use that HTML in the mail options
    const mailOptions = {
      from: '"FaceTrace Support" <hammadhl107@gmail.com>', // Display name + email
      to: email,
      subject: 'Your Password Recovery OTP',
      // text: `Here is your OTP: ${otp}`, // You can still provide text for older mail clients
      html: htmlContent,
    };

      transporter.sendMail(mailOptions, (mailErr, info) => {
        if (mailErr) {
          console.error('Error sending email:', mailErr);
          return res.status(500).json({ message: 'Error sending OTP email.' });
        }

        // OTP sent successfully
        return res.status(200).json({ message: 'OTP sent successfully.' });
      });
    });
  });
});

// 2) Verify OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  const query = 'SELECT username, reset_otp FROM Users WHERE email = ? LIMIT 1';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Server error.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No user found with that email.' });
    }

    const user = results[0];
    if (!user.reset_otp) {
      return res.status(400).json({ message: 'No OTP set for this user. Please request a new OTP.' });
    }

    // Debug prints (optional) to see what's being compared:
    console.log('Submitted OTP:', JSON.stringify(otp), 'Type:', typeof otp);
    console.log('Database OTP:', JSON.stringify(user.reset_otp), 'Type:', typeof user.reset_otp);

    // Trim & compare
    const submittedOtp = otp.toString().trim();
    const storedOtp = user.reset_otp.toString().trim();

    if (storedOtp === submittedOtp) {
      // Clear the OTP or set it to null after verification
      const clearOtpQuery = 'UPDATE Users SET reset_otp = NULL WHERE email = ?';
      db.query(clearOtpQuery, [email], () => {
        // Return the username so the front end knows which account to reset
        return res.status(200).json({ message: 'OTP verified.', username: user.username });
      });
    } else {
      return res.status(401).json({ message: 'Invalid OTP.' });
    }
  });
});

// -------------------- Update Password (existing) --------------------
app.post('/update-password', (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).json({ message: 'Username and new password are required.' });
  }

  bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ message: 'Error hashing password. Please try again later.' });
    }

    const updateQuery = 'UPDATE Users SET password = ? WHERE username = ?';
    db.query(updateQuery, [hashedPassword, username], (updateErr, result) => {
      if (updateErr) {
        console.error('Error updating password:', updateErr);
        return res
          .status(500)
          .json({ message: 'Error updating password. Please try again later.' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }

      return res.status(200).json({ message: 'Password updated successfully.' });
    });
  });
});


app.post('/fetch-person', (req, res) => {
  const { entityType, uniqueValue } = req.body;
  let query;
  let uniqueField;

  if (entityType === 'student') {
    query = 'SELECT * FROM Students WHERE regNumber = ?';
    uniqueField = 'regNumber';
  } else if (entityType === 'faculty') {
    query = 'SELECT * FROM Faculty WHERE facultyId = ?';
    uniqueField = 'facultyId';
  } else if (entityType === 'worker') {
    query = 'SELECT * FROM Workers WHERE workerId = ?';
    uniqueField = 'workerId';
  }

  db.query(query, [uniqueValue], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(404).json({ message: 'Person not found' });

    let person = results[0];

    // Check if the banEndDate has passed and remove the discipline case if it has
    if (person.banEndDate && new Date(person.banEndDate) < new Date()) {
      // Remove the discipline case
      const updateQuery = `UPDATE ${entityType === 'student' ? 'Students' : entityType === 'faculty' ? 'Faculty' : 'Workers'} SET disciplineCase = NULL, banStartDate = NULL, banEndDate = NULL WHERE ${uniqueField} = ?`;
      db.query(updateQuery, [uniqueValue], (updateErr) => {
        if (updateErr) {
          console.error('Error updating person:', updateErr);
          return res.status(500).json({ message: 'Error updating person.' });
        }
        // Update the person object
        person.disciplineCase = null;
        person.banStartDate = null;
        person.banEndDate = null;

        res.status(200).json(person);
      });
    } else {
      res.status(200).json(person);
    }
  });
});



app.post('/update-person', upload.single('photo'), (req, res) => {
  const { entityType, ...data } = req.body;
  let query;
  let values;

  const disciplineCase = data.disciplineCase ? data.disciplineCase : null;

  // Parse banStartDate and banEndDate
  const banStartDate = data.banStartDate || null;
  const banEndDate = data.banEndDate || null;

  // Determine unique field and table based on entityType
  let uniqueField;
  let tableName;

  if (entityType === 'student') {
    uniqueField = 'regNumber';
    tableName = 'Students';
  } else if (entityType === 'faculty') {
    uniqueField = 'facultyId';
    tableName = 'Faculty';
  } else if (entityType === 'worker') {
    uniqueField = 'workerId';
    tableName = 'Workers';
  } else {
    return res.status(400).json({ message: 'Invalid entity type.' });
  }

  const uniqueValue = data[uniqueField];

  // Function to proceed with the update
  const proceedWithUpdate = (facePhotoPath) => {
    if (entityType === 'student') {
      query =
        'UPDATE Students SET studentName = ?, department = ?, facePhoto = ?, disciplineCase = ?, banStartDate = ?, banEndDate = ? WHERE regNumber = ?';
      values = [
        data.studentName,
        data.department,
        facePhotoPath,
        disciplineCase,
        banStartDate,
        banEndDate,
        data.regNumber,
      ];
    } else if (entityType === 'faculty') {
      query =
        'UPDATE Faculty SET facultyName = ?, department = ?, facePhoto = ?, disciplineCase = ?, banStartDate = ?, banEndDate = ? WHERE facultyId = ?';
      values = [
        data.facultyName,
        data.department,
        facePhotoPath,
        disciplineCase,
        banStartDate,
        banEndDate,
        data.facultyId,
      ];
    } else if (entityType === 'worker') {
      query =
        'UPDATE Workers SET workerName = ?, facePhoto = ?, disciplineCase = ?, banStartDate = ?, banEndDate = ? WHERE workerId = ?';
      values = [
        data.workerName,
        facePhotoPath,
        disciplineCase,
        banStartDate,
        banEndDate,
        data.workerId,
      ];
    }

    db.query(query, values, async (err, result) => {
      if (err) {
        console.error('Error updating person:', err);
        return res.status(500).json({ message: 'Error updating person.' });
      }

      if (req.file) {
        // A new photo was uploaded, update the model
        const imagePath = path.join(__dirname, facePhotoPath);
        const label =
          entityType === 'student'
            ? `${data.studentName}_${data.regNumber}_${data.department}`
            : entityType === 'faculty'
            ? `${data.facultyName}_${data.facultyId}_${data.department}`
            : `${data.workerName}_${data.workerId}`;
        const additionalInfo = JSON.stringify(data);
        try {
          await updateModel(imagePath, label, entityType, additionalInfo);
          res.status(200).json({ message: 'Person updated successfully and model updated.' });
        } catch (error) {
          console.error('Error updating model:', error);
          res.status(500).json({ message: 'Error updating person and model.' });
        }
      } else {
        res.status(200).json({ message: 'Person updated successfully.' });
      }
    });
  };

  // Check if a new photo was uploaded
  if (req.file) {
    // A new photo was uploaded
    const label =
      entityType === 'student'
        ? `${data.studentName}_${data.regNumber}_${data.department}`
        : entityType === 'faculty'
        ? `${data.facultyName}_${data.facultyId}_${data.department}`
        : `${data.workerName}_${data.workerId}`;
    const newFilename = `${label}${path.extname(req.file.originalname)}`;
    const newFilePath = path.join(uploadsDir, newFilename);

    // Rename the uploaded file to the new filename
    fs.rename(req.file.path, newFilePath, async (err) => {
      if (err) {
        console.error('Error renaming file:', err);
        return res.status(500).json({ message: 'Error processing update.' });
      }
      const facePhotoPath = `uploads/${newFilename}`;
      proceedWithUpdate(facePhotoPath);
    });
  } else {
    // No new photo uploaded; fetch existing facePhoto
    const selectQuery = `SELECT facePhoto FROM ${tableName} WHERE ${uniqueField} = ?`;
    db.query(selectQuery, [uniqueValue], (err, results) => {
      if (err) {
        console.error('Error fetching existing facePhoto:', err);
        return res.status(500).json({ message: 'Error updating person.' });
      }

      const facePhotoPath = results[0].facePhoto || null;
      proceedWithUpdate(facePhotoPath);
    });
  }
});


app.post('/remove-discipline-case', (req, res) => {
  const { entityType, uniqueValue } = req.body;

  // Validate request body
  if (!entityType || !uniqueValue) {
    return res.status(400).json({ message: 'entityType and uniqueValue are required.' });
  }

  // Determine unique field and table based on entityType
  let uniqueField;
  let tableName;

  if (entityType === 'student') {
    uniqueField = 'regNumber';
    tableName = 'Students';
  } else if (entityType === 'faculty') {
    uniqueField = 'facultyId';
    tableName = 'Faculty';
  } else if (entityType === 'worker') {
    uniqueField = 'workerId';
    tableName = 'Workers';
  } else {
    return res.status(400).json({ message: 'Invalid entity type.' });
  }

  // Construct the SQL query to remove the discipline case
  const removeDisciplineCaseQuery = `
    UPDATE ${tableName}
    SET disciplineCase = NULL,
        banStartDate = NULL,
        banEndDate = NULL
    WHERE ${uniqueField} = ?
  `;

  // Execute the update query
  db.query(removeDisciplineCaseQuery, [uniqueValue], (err, result) => {
    if (err) {
      console.error(`Error removing discipline case for ${entityType}:`, err);
      return res.status(500).json({ message: 'Error removing discipline case.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `${entityType} with the provided identifier not found.` });
    }

    res.status(200).json({ message: 'Discipline case removed successfully.' });
  });
});

// Route to fetch all discipline cases
app.get('/discipline-cases', (req, res) => {
  // Queries to fetch discipline cases from all entities
  const studentQuery = 'SELECT id, studentName AS name, regNumber AS uniqueId, "Student" AS entityType, disciplineCase FROM Students WHERE disciplineCase IS NOT NULL';
  const facultyQuery = 'SELECT id, facultyName AS name, facultyId AS uniqueId, "Faculty" AS entityType, disciplineCase FROM Faculty WHERE disciplineCase IS NOT NULL';
  const workerQuery = 'SELECT id, workerName AS name, workerId AS uniqueId, "Worker" AS entityType, disciplineCase FROM Workers WHERE disciplineCase IS NOT NULL';

  // Execute studentQuery
  db.query(studentQuery, (err, studentResults) => {
    if (err) {
      console.error('Error fetching student discipline cases:', err);
      return res.status(500).json({ message: 'Error fetching discipline cases.' });
    }

    // Execute facultyQuery
    db.query(facultyQuery, (err, facultyResults) => {
      if (err) {
        console.error('Error fetching faculty discipline cases:', err);
        return res.status(500).json({ message: 'Error fetching discipline cases.' });
      }

      // Execute workerQuery
      db.query(workerQuery, (err, workerResults) => {
        if (err) {
          console.error('Error fetching worker discipline cases:', err);
          return res.status(500).json({ message: 'Error fetching discipline cases.' });
        }

        // Combine all results
        const allDisciplineCases = [...studentResults, ...facultyResults, ...workerResults];

        res.status(200).json(allDisciplineCases);
      });
    });
  });
});

app.post('/alerts', [
  // Input validation using express-validator
  body('name').notEmpty().withMessage('Name is required.'),
  body('category').notEmpty().withMessage('Category is required.'),
  body('timestamp').isISO8601().withMessage('Valid timestamp is required.'),
  body('additionalInfo').optional().isObject().withMessage('additionalInfo must be an object.'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return validation errors
    return res.status(400).json({ message: 'Invalid input.', errors: errors.array() });
  }

  const { name, category, timestamp, additionalInfo } = req.body;
  const isKnownAlert = category.toLowerCase() !== 'unknown';

  if (isKnownAlert) {
    // Check if known alerts are enabled
    const settingsQuery = 'SELECT value FROM Settings WHERE key_name = ? LIMIT 1';
    db.query(settingsQuery, ['known_alerts_enabled'], (settingsErr, settingsResults) => {
      if (settingsErr) {
        console.error('Error fetching settings:', settingsErr);
        return res.status(500).json({ message: 'Server error while fetching settings.' });
      }

      // Determine if known alerts are enabled
      let knownAlertsEnabled = true; // Default to true if not set
      if (settingsResults.length > 0) {
        knownAlertsEnabled = settingsResults[0].value === 'true';
      }

      if (!knownAlertsEnabled) {
        // Known alerts are disabled; reject the request
        return res.status(403).json({ message: 'Known alerts are currently disabled.' });
      }

      // Proceed to insert the alert
      insertAlert();
    });
  } else {
    // Unknown alerts can always be inserted
    insertAlert();
  }

  function insertAlert() {
    const query = 'INSERT INTO Alerts (name, category, timestamp, additionalInfo) VALUES (?, ?, ?, ?)';
    db.query(query, [name, category, timestamp, JSON.stringify(additionalInfo)], (err, result) => {
      if (err) {
        console.error('Error inserting alert into database:', err);
        return res.status(500).json({ message: 'Error saving alert to database.' });
      }

      // Prepare the alert message for broadcasting (if applicable)
      const alertMessage = {
        id: result.insertId, // Assuming you want to include the new alert's ID
        name: name,
        category: category,
        timestamp: timestamp,
        additionalInfo: additionalInfo,
        disciplineCase: additionalInfo?.disciplineCase || null, // Adjust based on your schema
      };

      // Uncomment and implement your broadcasting logic here
      // broadcastAlert(alertMessage);

      return res.status(200).json({ message: 'Alert saved successfully.', alert: alertMessage });
    });
  }
});

// -------------------- GET /alerts Endpoint with Known Alerts Check --------------------
app.get('/alerts', (req, res) => {
  // Fetch the known_alerts_enabled setting
  const settingsQuery = 'SELECT value FROM Settings WHERE key_name = ? LIMIT 1';
  db.query(settingsQuery, ['known_alerts_enabled'], (settingsErr, settingsResults) => {
    if (settingsErr) {
      console.error('Error fetching settings:', settingsErr);
      return res.status(500).json({ message: 'Error fetching settings.' });
    }

    // Determine if known alerts are enabled
    let knownAlertsEnabled = true; // Default to true if not set
    if (settingsResults.length > 0) {
      knownAlertsEnabled = settingsResults[0].value === 'true';
    }

    // Construct the base query
    let query = `
      SELECT 
        Alerts.*,
        CASE 
          WHEN Alerts.category = 'student' THEN Students.disciplineCase
          WHEN Alerts.category = 'faculty' THEN Faculty.disciplineCase
          WHEN Alerts.category = 'worker' THEN Workers.disciplineCase
          ELSE NULL 
        END AS disciplineCase
      FROM Alerts
      LEFT JOIN Students 
        ON Alerts.category = 'student' 
        AND Students.regNumber = JSON_UNQUOTE(JSON_EXTRACT(Alerts.additionalInfo, '$.RegNo'))
      LEFT JOIN Faculty 
        ON Alerts.category = 'faculty' 
        AND Faculty.facultyId = JSON_UNQUOTE(JSON_EXTRACT(Alerts.additionalInfo, '$.FacultyId'))
      LEFT JOIN Workers 
        ON Alerts.category = 'worker' 
        AND Workers.workerId = JSON_UNQUOTE(JSON_EXTRACT(Alerts.additionalInfo, '$.WorkerId'))
    `;

    // Modify the query based on knownAlertsEnabled
    if (!knownAlertsEnabled) {
      // Exclude known alerts by ensuring category is 'unknown'
      query += ` WHERE Alerts.category = 'unknown' `;
    }

    // Add ORDER BY clause (assuming 'timestamp' is the correct field)
    query += ` ORDER BY Alerts.timestamp DESC `;

    // Execute the query
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching alerts:', err);
        return res.status(500).json({ message: 'Error fetching alerts from database.' });
      }

      // Parse the additionalInfo JSON if it's a string
      const parsedResults = results.map(alert => ({
        ...alert,
        additionalInfo: typeof alert.additionalInfo === 'string' ? JSON.parse(alert.additionalInfo) : alert.additionalInfo || {},
      }));

      res.json(parsedResults);
    });
  });
});



// Unknown person endpoint
app.post('/unknown-alert', (req, res) => {
  const { timestamp, image_path } = req.body;
  if (!image_path || !timestamp) {
    return res.status(400).json({ message: 'Invalid data received.' });
  }

  let normalizedPath = image_path.replace(/\\/g, '/');
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }

  const alertData = {
    name: 'Unknown',
    category: 'unknown',
    timestamp,
    additionalInfo: JSON.stringify({ image_path: normalizedPath }),
  };

  const query =
    'INSERT INTO Alerts (name, category, timestamp, additionalInfo) VALUES (?, ?, ?, ?)';
  db.query(
    query,
    [alertData.name, alertData.category, alertData.timestamp, alertData.additionalInfo],
    (err, result) => {
      if (err) {
        console.error('Error inserting alert into database:', err);
        return res.status(500).json({ message: 'Error saving alert to database.' });
      }

      // broadcastAlert(...); // If you have a broadcast

      return res.status(200).json({ message: 'Unknown person alert recorded successfully.' });
    }
  );
});


// -------------------- Get Setting --------------------
app.get('/settings/:key', (req, res) => {
  const { key } = req.params;

  const query = 'SELECT value FROM Settings WHERE key_name = ? LIMIT 1';
  db.query(query, [key], (err, results) => {
    if (err) {
      console.error('Error fetching setting:', err);
      return res.status(500).json({ message: 'Error fetching setting.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Setting not found.' });
    }

    return res.status(200).json({ key, value: results[0].value });
  });
});

// -------------------- Update Setting --------------------
app.post(
  '/settings/:key',
  [
    body('value')
      .isIn(['true', 'false'])
      .withMessage('value must be true or false.'),
  ],
  (req, res) => {
    const { key } = req.params;
    const { value } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input.', errors: errors.array() });
    }

    const query = 'INSERT INTO Settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?';
    db.query(query, [key, value, value], (err, results) => {
      if (err) {
        console.error('Error updating setting:', err);
        return res.status(500).json({ message: 'Error updating setting.' });
      }

      return res.status(200).json({ key, value });
    });
  }
);



// -------------------- Check Person Exists --------------------
app.post(
  '/check-person',
  [
    body('entityType')
      .isIn(['student', 'faculty', 'worker'])
      .withMessage('entityType must be student, faculty, or worker.'),
    body('uniqueValue').notEmpty().withMessage('uniqueValue is required.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: 'Invalid input.', errors: errors.array() });
    }

    const { entityType, uniqueValue } = req.body;

    let selectQuery = '';

    if (entityType === 'student') {
      selectQuery = 'SELECT * FROM Students WHERE regNumber = ?';
    } else if (entityType === 'faculty') {
      selectQuery = 'SELECT * FROM Faculty WHERE facultyId = ?';
    } else if (entityType === 'worker') {
      selectQuery = 'SELECT * FROM Workers WHERE workerId = ?';
    }

    db.query(selectQuery, [uniqueValue], (err, results) => {
      if (err) {
        console.error('Error selecting person:', err);
        return res.status(500).json({ message: 'Server error.' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Person not found in DB.' });
      }

      // Optionally, return some details
      return res.status(200).json({ exists: true, person: results[0] });
    });
  }
);

// DELETE PERSON ROUTE
app.delete('/delete-person', async (req, res) => {
  const { entityType, uniqueValue } = req.body;
  
  // Validate inputs
  if (!entityType || !uniqueValue) {
    return res.status(400).json({ message: 'entityType and uniqueValue are required.' });
  }

  let selectQuery = '';
  let deleteQuery = '';
  let label = '';
  let filePathColumn = '';
  
  if (entityType === 'student') {
    // We'll fetch from Students by regNumber
    selectQuery = 'SELECT studentName, regNumber, department, facePhoto FROM Students WHERE regNumber = ?';
    deleteQuery = 'DELETE FROM Students WHERE regNumber = ?';
    filePathColumn = 'facePhoto';
  } else if (entityType === 'faculty') {
    // We'll fetch from Faculty by facultyId
    selectQuery = 'SELECT facultyName, facultyId, department, facePhoto FROM Faculty WHERE facultyId = ?';
    deleteQuery = 'DELETE FROM Faculty WHERE facultyId = ?';
    filePathColumn = 'facePhoto';
  } else if (entityType === 'worker') {
    // We'll fetch from Workers by workerId
    selectQuery = 'SELECT workerName, workerId, facePhoto FROM Workers WHERE workerId = ?';
    deleteQuery = 'DELETE FROM Workers WHERE workerId = ?';
    filePathColumn = 'facePhoto';
  } else {
    return res.status(400).json({ message: 'Invalid entityType.' });
  }

  // 1) Find the person in DB
  db.query(selectQuery, [uniqueValue], (selectErr, selectResults) => {
    if (selectErr) {
      console.error('Error selecting person:', selectErr);
      return res.status(500).json({ message: 'Error fetching person from DB.' });
    }

    if (selectResults.length === 0) {
      return res.status(404).json({ message: 'Person not found in DB.' });
    }

    // We have the person row
    const row = selectResults[0];
    let photoPath = row[filePathColumn]; // e.g. "uploads/Name_ID_dept.jpg"

    // 2) Reconstruct the label used during registration
    //    This must match EXACTLY how you formed it in /register
    if (entityType === 'student') {
      // label = `${studentName}_${regNumber}_${department}`;
      label = `${row.studentName}_${row.regNumber}_${row.department}`;
    } else if (entityType === 'faculty') {
      // label = `${facultyName}_${facultyId}_${department}`;
      label = `${row.facultyName}_${row.facultyId}_${row.department}`;
    } else if (entityType === 'worker') {
      // label = `${workerName}_${workerId}`;
      label = `${row.workerName}_${row.workerId}`;
    }

    console.log('Reconstructed label:', label);

    // 3) Delete from DB
    db.query(deleteQuery, [uniqueValue], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error('Error deleting person from DB:', deleteErr);
        return res.status(500).json({ message: 'Error deleting person.' });
      }

      if (deleteResult.affectedRows === 0) {
        // Possibly a race condition or record was removed already
        return res.status(404).json({ message: 'Person not found.' });
      }

      // 4) Remove encodings from the Python model
      if (!label) {
        console.error('No label found to remove encodings.');
        return res.status(200).json({
          message: 'Person deleted from DB, but no label found for removing encodings.'
        });
      }

      const pyProcess = spawn('python', [
        'face_trace_comsis.py',  // or your exact path to face_trace_comsis.py
        'remove_encoding',
        'something',
        label
      ]);

      pyProcess.stdout.on('data', (data) => {
        console.log('Python STDOUT:', data.toString());
      });

      pyProcess.stderr.on('data', (data) => {
        console.error('Python STDERR:', data.toString());
      });

      pyProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);

        // 5) Optionally remove the image file from "uploads/" 
        //    (Only do this if you really want the photo gone.)
        if (photoPath) {
          // Make sure we have an absolute path
          const absolutePhotoPath = path.join(__dirname, photoPath);
          fs.unlink(absolutePhotoPath, (err) => {
            if (err) {
              console.error('Error deleting image file:', err);
              // We won't fail the entire request for that
            } else {
              console.log('Image file deleted:', absolutePhotoPath);
            }

            // Send the final response after removing the file
            if (code === 0) {
              return res.status(200).json({
                message: 'Person deleted from DB, encodings removed, and photo deleted successfully.'
              });
            } else {
              return res.status(200).json({
                message: 'Person deleted from DB and photo removed, but removing encodings in Python failed.'
              });
            }
          });
        } else {
          // No photo to remove
          if (code === 0) {
            return res.status(200).json({
              message: 'Person deleted from DB and encodings removed successfully (no photo found).'
            });
          } else {
            return res.status(200).json({
              message: 'Person deleted from DB, but removing encodings in Python failed (no photo found).'
            });
          }
        }
      });
    });
  });
});



app.post('/detect-faculty', (req, res) => {
  const { name, timestamp } = req.body;

  if (!name || !timestamp) {
    return res.status(400).json({ message: 'Invalid data received.' });
  }

  // Parse the incoming UTC timestamp
  const parsedDate = new Date(timestamp);
  if (isNaN(parsedDate)) {
    return res.status(400).json({ message: 'Invalid timestamp format.' });
  }

  // Convert to MySQL DATETIME format (UTC)
  const formattedTimestamp = parsedDate.toISOString().slice(0, 19).replace('T', ' ');
  const detectionDate = parsedDate.toISOString().split('T')[0]; // YYYY-MM-DD format

  // Check if an entry exists for the same faculty and date
  const selectQuery = 'SELECT * FROM FacultyAttendance WHERE name = ? AND detection_date = ?';
  
  db.query(selectQuery, [name, detectionDate], (err, results) => {
    if (err) {
      console.error('Error checking for existing attendance record:', err);
      return res.status(500).json({ message: 'Error checking for existing attendance record.' });
    }

    if (results.length === 0) {
      // No entry found, this is an entry time
      const insertQuery = 'INSERT INTO FacultyAttendance (name, entry_time, detection_date, attendance_status) VALUES (?, ?, ?, ?)';
      db.query(insertQuery, [name, formattedTimestamp, detectionDate, 'Incomplete'], (err, result) => {
        if (err) {
          console.error('Error inserting new attendance record:', err);
          return res.status(500).json({ message: 'Error inserting new attendance record.' });
        }
        console.log(`Entry time recorded for ${name} on ${detectionDate}`);
        res.status(200).json({ message: 'Entry time recorded successfully.' });
      });
    } else {
      // Entry exists, this is an exit time
      const entryTime = new Date(results[0].entry_time); // Already in UTC
      const exitTime = parsedDate; // Already in UTC

      // Get total time in milliseconds
      const totalTimeMs = exitTime - entryTime;

      const attendanceStatus = totalTimeMs >= 8 * 60 * 60 * 1000 ? 'Complete' : 'Incomplete';

      //const attendanceStatus = totalTimeMs >= 8 * 60 * 1000 ? 'Complete' : 'Incomplete';

      const updateQuery = 'UPDATE FacultyAttendance SET exit_time = ?, total_time_hours = ?, attendance_status = ? WHERE name = ? AND detection_date = ?';
      db.query(updateQuery, [formattedTimestamp, totalTimeMs, attendanceStatus, name, detectionDate], (err, result) => {
        if (err) {
          console.error('Error updating attendance record:', err);
          return res.status(500).json({ message: 'Error updating attendance record.' });
        }
        console.log(`Attendance updated for ${name} on ${detectionDate} with total time ${totalTimeMs} milliseconds.`);
        res.status(200).json({ message: 'Exit time and attendance updated successfully.' });
      });
    }
  });
});


// Route to get all attendance data
app.get('/attendance', (req, res) => {
  const query = `
    SELECT 
      id, 
      name, 
      entry_time, 
      IFNULL(exit_time, 'No exit recorded') as exit_time, 
      IFNULL(total_time_hours, 0) as total_time_hours,  -- Replace null total time hours with 0
      attendance_status, 
      detection_date 
    FROM FacultyAttendance 
    ORDER BY detection_date DESC`;  // Fetch all attendance records

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching attendance records:', err);
      return res.status(500).json({ message: 'Error fetching attendance records from database.' });
    }

    // Send the fetched attendance records as JSON to the frontend
    res.json(results);
  });
});



// Trigger Python script to update the model
const updateModel = (imagePath, label, entityType, additionalInfo) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'face_trace_comsis.py');

    // Pass arguments as an array to handle spaces and special characters
    const args = [
      scriptPath,
      'update_model',
      imagePath,
      label,
      entityType,
      additionalInfo
    ];

    console.log('Executing Python Script with arguments:', args);

    const pythonProcess = spawn('python', args);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        console.error(`stderr: ${stderr}`);
        console.error(`stdout: ${stdout}`);
        return reject(new Error(`Python script failed with code ${code}`));
      }
      console.log(`Python Script Output: ${stdout}`);
      resolve(stdout);
    });
  });
};


// Define routes
app.post('/register', upload.single('photo'), (req, res) => {
  try {
    const { entityType } = req.body;
    let data = req.body;
    let label;
    let newFilename;

    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No photo uploaded.' });
    }

    // Parse data if sent as JSON string (in case of multipart/form-data)
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    // Determine the label and new filename based on the entity type
    if (entityType === 'student') {
      label = `${data.studentName}_${data.regNumber}_${data.department}`;
    } else if (entityType === 'faculty') {
      label = `${data.facultyName}_${data.facultyId}_${data.department}`;
    } else if (entityType === 'worker') {
      label = `${data.workerName}_${data.workerId}`;
    } else {
      return res.status(400).json({ message: 'Invalid entity type.' });
    }

    // Generate the new filename
    newFilename = `${label}${path.extname(req.file.originalname)}`;

    // Debugging: Log the new filename
    console.log('New filename:', newFilename);

    // Construct the new file path
    const newFilePath = path.join(uploadsDir, newFilename);

    // Debugging: Log the new file path
    console.log('New file path:', newFilePath);

    // Rename the uploaded file to the new filename
    fs.rename(req.file.path, newFilePath, async (err) => {
      if (err) {
        console.error('Error renaming file:', err);
        return res.status(500).json({ message: 'Error processing registration.' });
      }

      // Store the relative file path in the database (e.g., 'uploads/filename.jpg')
      const facePhotoPath = `uploads/${newFilename}`;

      // Debugging: Log the facePhotoPath
      console.log('facePhotoPath stored in DB:', facePhotoPath);

      // Prepare the SQL query and values based on the entity type
      let query;
      let values;

      if (entityType === 'student') {
        query =
          'INSERT INTO Students (studentName, regNumber, department, facePhoto) VALUES (?, ?, ?, ?)';
        values = [data.studentName, data.regNumber, data.department, facePhotoPath];
      } else if (entityType === 'faculty') {
        query =
          'INSERT INTO Faculty (facultyName, facultyId, department, facePhoto) VALUES (?, ?, ?, ?)';
        values = [data.facultyName, data.facultyId, data.department, facePhotoPath];
      } else if (entityType === 'worker') {
        query =
          'INSERT INTO Workers (workerName, workerId, facePhoto) VALUES (?, ?, ?)';
        values = [data.workerName, data.workerId, facePhotoPath];
      }

      // Insert the new person into the database
      db.query(query, values, async (err, result) => {
        if (err) {
          console.error('SQL Error:', err);
          return res.status(500).json({ message: 'Error registering user.' });
        }

        // Optionally, trigger a model update with the new file
        try {
          const additionalInfo = JSON.stringify(data);
          await updateModel(newFilePath, label, entityType, additionalInfo);
          res
            .status(200)
            .json({ message: 'Person registered and model updated successfully.' });
        } catch (error) {
          console.error('Error updating model:', error);
          res
            .status(500)
            .json({ message: 'Error registering person and updating model.' });
        }
      });
    });
  } catch (error) {
    console.error('Error in /register route:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});



app.get('/api/stats/user-registrations', (req, res) => {
  const query = `
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') AS month, 
      COUNT(*) AS count 
    FROM Users 
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY month
    ORDER BY month ASC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching user registrations:', err);
      return res.status(500).json({ message: 'Error fetching user registrations.' });
    }

    res.json(results);
  });
});

// Route to get alerts generated over the past 30 days
app.get('/api/stats/alerts-over-time', (req, res) => {
  const query = `
    SELECT 
      DATE(created_at) AS date, 
      COUNT(*) AS count 
    FROM Alerts 
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY date
    ORDER BY date ASC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching alerts data:', err);
      return res.status(500).json({ message: 'Error fetching alerts data.' });
    }

    res.json(results);
  });
});

// Route to get attendance statistics
app.get('/api/stats/attendance-statistics', (req, res) => {
  const query = `
    SELECT 
      COUNT(*) AS totalEntries 
    FROM FacultyAttendance 
    WHERE entry_time IS NOT NULL;
  `;

  const exitQuery = `
    SELECT 
      COUNT(*) AS totalExits 
    FROM FacultyAttendance 
    WHERE exit_time IS NOT NULL;
  `;

  db.query(query, (err, entryResults) => {
    if (err) {
      console.error('Error fetching total entries:', err);
      return res.status(500).json({ message: 'Error fetching attendance data.' });
    }

    db.query(exitQuery, (err, exitResults) => {
      if (err) {
        console.error('Error fetching total exits:', err);
        return res.status(500).json({ message: 'Error fetching attendance data.' });
      }

      res.json({
        totalEntries: entryResults[0].totalEntries,
        totalExits: exitResults[0].totalExits,
      });
    });
  });
});



app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
