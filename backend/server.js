const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const PIN = '123456';

const user = {
  name: 'Riya Sharma',
  dob: '12 May 2003',
  dobRaw: '12/05/2003',
  email: 'riya@gmail.com',
  phone: '+91 9876543210',
  address: 'Mumbai, Maharashtra, India',
  aadhaar: 'XXXX-XXXX-1234',
  pan: 'ABCDE1234F'
};

app.post('/send-otp', (req, res) => {
  res.json({ ok: true });
});

app.post('/login', (req, res) => {
  const { pin } = req.body;
  if (pin !== PIN) return res.json({ ok: false, msg: 'Wrong PIN. Use 123456' });
  res.json({ ok: true, token: 'mock_jwt_token' });
});

app.get('/get-user', (req, res) => {
  res.json({ ok: true, data: user });
});

app.put('/update-user-data', (req, res) => {
  const { name, email, address, dob } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (address) user.address = address;
  if (dob) user.dob = dob;
  res.json({ ok: true });
});

app.post('/process-doc', (req, res) => {
  setTimeout(() => {
    res.json({ ok: true, data: { name: user.name, dob: user.dobRaw, aadhaar: user.aadhaar, address: user.address } });
  }, 2000);
});

app.post('/chat', (req, res) => {
  const msg = (req.body.msg || '').toLowerCase();
  let reply = '', masked = false;
  if (msg.includes('aadhaar') || msg.includes('aadhar')) { reply = 'For security, only last 4 digits shown: XXXX-XXXX-1234'; masked = true; }
  else if (msg.includes('dob') || msg.includes('birth')) reply = 'Your Date of Birth is: 12 May 2003';
  else if (msg.includes('name')) reply = 'Your registered name is: Riya Sharma';
  else if (msg.includes('email')) reply = 'Your email is: riya@gmail.com';
  else if (msg.includes('phone') || msg.includes('mobile')) reply = 'Your phone: +91 9876543210';
  else if (msg.includes('address')) reply = 'Your address: Mumbai, Maharashtra, India';
  else if (msg.includes('pan')) { reply = 'PAN masked for security: ***E1234F'; masked = true; }
  else if (msg.includes('document')) reply = '3 documents uploaded: Aadhaar, PAN, Resume - all verified';
  else if (msg.includes('hello') || msg.includes('hi')) reply = 'Hello Riya! Ask me about your name, DOB, email, address or documents!';
  else if (msg.includes('fill') || msg.includes('autofill')) reply = 'Go to Form Autofill page and click Autofill using AutoForm AI!';
  else reply = 'Try asking: name, DOB, email, address, Aadhaar, or documents';
  res.json({ ok: true, reply, masked });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log('AutoForm AI running on http://localhost:' + PORT));
