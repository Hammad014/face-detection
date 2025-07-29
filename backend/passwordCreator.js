// generateHash.js

const bcrypt = require('bcrypt');

// Replace this with the desired password
const plainPassword = 'incharge321';

const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed Password:', hash);
});
