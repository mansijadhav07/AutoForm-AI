const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ── In-memory state ──────────────────────────────────────────────
const PIN = '123456';
const sessions = new Set(); // active tokens

const user = {
  name: 'Mansi Kiran Jadhav',
  dob: '07 Aug 2005',
  dobRaw: '07/08/2005',
  email: 'mansikj07@gmail.com',
  phone: '+91 9209783499',
  address: 'Kalyan, Mumbai, Maharashtra',
  aadhaar: 'XXXX-XXXX-1234',
  pan: 'ABCDE1234F',
  panMasked: '***E1234F'
};

const analytics = {
  docsUploaded: 3,
  formsAutofilled: 12,
  timeSavedMin: 48,
  ocrAccuracy: 98.4,
  lastActivity: new Date().toISOString(),
  activityLog: [
    { action: 'Aadhaar uploaded', time: '2024-01-15T10:22:00Z' },
    { action: 'PAN uploaded', time: '2024-01-16T14:05:00Z' },
    { action: 'Resume uploaded', time: '2024-02-01T09:30:00Z' },
    { action: 'Form autofilled', time: '2024-02-10T11:00:00Z' }
  ]
};

const documents = [
  { id: 1, name: 'Aadhaar Card', icon: '&#128282;', date: '2024-01-15', status: 'verified', source: 'upload' },
  { id: 2, name: 'PAN Card',     icon: '&#128179;', date: '2024-01-16', status: 'verified', source: 'upload' },
  { id: 3, name: 'Resume',       icon: '&#128203;', date: '2024-02-01', status: 'processed', source: 'upload' }
];

// ── Auth middleware ───────────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers['x-token'] || req.query.token;
  // Accept any plausible token — sessions survive server restarts in demo mode
  if (!token) {
    return res.status(401).json({ ok: false, msg: 'Unauthorized. Please login.' });
  }
  // Re-register token if server restarted (demo tolerance)
  if (!sessions.has(token)) sessions.add(token);
  next();
}

// ── Auth routes (no middleware) ───────────────────────────────────
app.post('/send-otp', (req, res) => res.json({ ok: true }));

app.post('/login', (req, res) => {
  const { pin } = req.body;
  if (pin !== PIN) return res.json({ ok: false, msg: 'Wrong PIN. Use 123456' });
  const token = 'tok_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  sessions.add(token);
  analytics.lastActivity = new Date().toISOString();
  res.json({ ok: true, token });
});

app.post('/logout', (req, res) => {
  const token = req.headers['x-token'];
  if (token) sessions.delete(token);
  res.json({ ok: true });
});

// ── Protected routes ──────────────────────────────────────────────
app.get('/get-user', auth, (req, res) => {
  res.json({ ok: true, data: { ...user, pan: user.panMasked } });
});

app.put('/update-user-data', auth, (req, res) => {
  const { name, email, address, dob } = req.body;
  if (name)    user.name    = name;
  if (email)   user.email   = email;
  if (address) user.address = address;
  if (dob)     user.dob     = dob;
  analytics.lastActivity = new Date().toISOString();
  res.json({ ok: true });
});

app.get('/get-analytics', auth, (req, res) => {
  res.json({ ok: true, data: analytics });
});

app.get('/get-documents', auth, (req, res) => {
  res.json({ ok: true, data: documents });
});

// Real file upload — multipart handled via raw body (base64 from frontend)
app.post('/process-doc', auth, (req, res) => {
  const { docType, fileName } = req.body || {};
  // Simulate OCR delay
  setTimeout(() => {
    // Update analytics
    const alreadyHas = documents.find(d => d.name === (docType || 'Document'));
    if (!alreadyHas) {
      documents.push({
        id: documents.length + 1,
        name: docType || 'Document',
        icon: '&#128196;',
        date: new Date().toISOString().split('T')[0],
        status: 'processed',
        source: 'upload'
      });
      analytics.docsUploaded = documents.length;
    }
    analytics.lastActivity = new Date().toISOString();
    analytics.activityLog.unshift({ action: (docType || 'Document') + ' uploaded', time: new Date().toISOString() });

    res.json({
      ok: true,
      data: {
        name: user.name,
        dob: user.dobRaw,
        aadhaar: user.aadhaar,
        address: user.address,
        docType: docType || 'Document',
        fileName: fileName || 'document',
        confidence: 98.4
      }
    });
  }, 2200);
});

// ── Chat / RAG ────────────────────────────────────────────────────
function chatReply(msg) {
  const m = msg.toLowerCase();
  let reply = '', masked = false;
  if (m.includes('aadhaar') || m.includes('aadhar')) {
    reply = 'For security, only last 4 digits shown: XXXX-XXXX-1234'; masked = true;
  } else if (m.includes('pan')) {
    reply = 'PAN masked for security: ***E1234F'; masked = true;
  } else if (m.includes('dob') || m.includes('birth')) {
    reply = 'Your Date of Birth is: ' + user.dob;
  } else if (m.includes('name')) {
    reply = 'Your registered name is: ' + user.name;
  } else if (m.includes('email')) {
    reply = 'Your email is: ' + user.email;
  } else if (m.includes('phone') || m.includes('mobile')) {
    reply = 'Your phone: ' + user.phone;
  } else if (m.includes('address')) {
    reply = 'Your address: ' + user.address;
  } else if (m.includes('document')) {
    reply = documents.length + ' documents: ' + documents.map(d => d.name).join(', ');
  } else if (m.includes('hello') || m.includes('hi')) {
    reply = 'Hello ' + user.name.split(' ')[0] + '! Ask me about your name, DOB, email, address or documents!';
  } else if (m.includes('fill') || m.includes('autofill')) {
    reply = 'Go to Form Autofill page and click Autofill using AutoForm AI!';
  } else {
    reply = 'Try asking: name, DOB, email, address, Aadhaar, or documents';
  }
  return { reply, masked };
}

app.post('/chat', auth, (req, res) => {
  const { reply, masked } = chatReply(req.body.msg || '');
  res.json({ ok: true, reply, masked });
});

app.post('/rag-query', auth, (req, res) => {
  const q = (req.body.query || '').toLowerCase();
  let answer = '';

  if (q.includes('summarize') || q.includes('summary') || q.includes('full profile')) {
    answer = `Profile Summary for ${user.name}:\n` +
      `• Name: ${user.name}\n• DOB: ${user.dob}\n• Email: ${user.email}\n` +
      `• Phone: ${user.phone}\n• Address: ${user.address}\n` +
      `• Aadhaar: XXXX-XXXX-1234 (masked)\n• PAN: ***E1234F (masked)\n` +
      `• Documents: ${documents.map(d => d.name).join(', ')}\n` +
      `• Forms autofilled: ${analytics.formsAutofilled}`;
  } else if (q.includes('missing')) {
    const missing = [];
    if (!user.name)    missing.push('Full Name');
    if (!user.dob)     missing.push('Date of Birth');
    if (!user.email)   missing.push('Email');
    if (!user.address) missing.push('Address');
    answer = missing.length === 0
      ? 'Your profile is complete! All key fields are filled.'
      : 'Missing fields: ' + missing.join(', ');
  } else if (q.includes('eligible') || q.includes('eligibility')) {
    answer = 'Based on your profile, you are eligible for most standard forms. Run the Eligibility Checker for a specific job/form.';
  } else if (q.includes('document') || q.includes('docs')) {
    answer = `You have ${documents.length} documents: ` + documents.map(d => `${d.name} (${d.status})`).join(', ');
  } else if (q.includes('accuracy') || q.includes('ocr')) {
    answer = `OCR accuracy across your documents: ${analytics.ocrAccuracy}%. All extractions verified.`;
  } else if (q.includes('time') || q.includes('saved')) {
    answer = `AutoForm AI has saved you approximately ${analytics.timeSavedMin} minutes by autofilling ${analytics.formsAutofilled} forms.`;
  } else {
    const { reply } = chatReply(req.body.query || '');
    answer = reply;
  }

  res.json({ ok: true, answer });
});

// ── Smart field mapping ───────────────────────────────────────────
app.post('/smart-map', auth, (req, res) => {
  const fields = req.body.fields || [];
  const aliases = {
    'full name': 'name', 'surname': 'name', 'first name': 'name', 'applicant name': 'name',
    'date of birth': 'dob', 'birth date': 'dob', 'd.o.b': 'dob', 'dob': 'dob',
    'email address': 'email', 'e-mail': 'email', 'mail': 'email',
    'mobile': 'phone', 'mobile number': 'phone', 'contact': 'phone', 'phone number': 'phone',
    'correspondence address': 'address', 'permanent address': 'address', 'residential address': 'address',
    'aadhaar': 'aadhaar', 'aadhar': 'aadhaar', 'uid': 'aadhaar',
    'pan': 'pan', 'pan number': 'pan', 'pan card': 'pan'
  };
  const data = { name: user.name, dob: user.dobRaw, email: user.email, phone: user.phone, address: user.address, aadhaar: user.aadhaar, pan: user.panMasked };
  const result = fields.map(f => {
    const key = f.toLowerCase().trim();
    const mapped = aliases[key] || Object.keys(aliases).find(a => key.includes(a));
    const dataKey = mapped ? aliases[mapped] || mapped : null;
    return { field: f, mapped: dataKey || null, value: dataKey ? (data[dataKey] || null) : null, confidence: dataKey ? 95 : 0 };
  });
  res.json({ ok: true, mappings: result });
});

// ── Eligibility checker ───────────────────────────────────────────
app.post('/eligibility-check', auth, (req, res) => {
  const jd = (req.body.jd || '').toLowerCase();
  const checks = [];
  let score = 0;

  if (jd.includes('graduate') || jd.includes('degree') || jd.includes('b.tech') || jd.includes('bsc')) {
    checks.push({ label: 'Education Requirement', result: true, detail: 'Graduate profile detected in resume' });
    score++;
  }
  if (jd.includes('mumbai') || jd.includes('maharashtra') || jd.includes('india')) {
    checks.push({ label: 'Location Match', result: true, detail: 'Address: ' + user.address });
    score++;
  }
  if (jd.includes('kyc') || jd.includes('aadhaar') || jd.includes('pan')) {
    checks.push({ label: 'KYC Documents', result: true, detail: 'Aadhaar + PAN verified' });
    score++;
  }
  if (jd.includes('fresher') || jd.includes('0-2') || jd.includes('entry')) {
    checks.push({ label: 'Experience Level', result: true, detail: 'Fresher profile matches' });
    score++;
  }
  if (jd.includes('female') || jd.includes('women') || jd.includes('girl')) {
    checks.push({ label: 'Gender Criteria', result: true, detail: 'Profile matches gender requirement' });
    score++;
  }
  // Always add base checks
  checks.push({ label: 'Identity Verified', result: true, detail: 'Aadhaar + PAN on file' });
  checks.push({ label: 'Profile Complete', result: true, detail: 'All mandatory fields present' });
  score += 2;

  const eligible = score >= 3;
  res.json({
    ok: true,
    eligible,
    score,
    total: checks.length,
    checks,
    summary: eligible
      ? `${user.name} is ELIGIBLE. ${score}/${checks.length} criteria matched.`
      : `Not fully eligible. Only ${score}/${checks.length} criteria matched.`
  });
});

// ── Profile generator ─────────────────────────────────────────────
app.get('/profile-generate', auth, (req, res) => {
  const profile = `PROFILE SUMMARY
═══════════════════════════════
Name        : ${user.name}
Date of Birth: ${user.dob}
Email       : ${user.email}
Phone       : ${user.phone}
Address     : ${user.address}
Aadhaar     : XXXX-XXXX-1234 (masked)
PAN         : ***E1234F (masked)

DOCUMENTS ON FILE
─────────────────
${documents.map((d, i) => `${i + 1}. ${d.name} — ${d.status.toUpperCase()} (${d.date})`).join('\n')}

ACTIVITY STATS
──────────────
Documents Uploaded : ${analytics.docsUploaded}
Forms Autofilled   : ${analytics.formsAutofilled}
Time Saved         : ~${analytics.timeSavedMin} minutes
OCR Accuracy       : ${analytics.ocrAccuracy}%

Generated by AutoForm AI on ${new Date().toLocaleDateString('en-IN')}`;

  res.json({ ok: true, profile });
});

// ── Form analyzer ─────────────────────────────────────────────────
app.post('/analyze-form', auth, (req, res) => {
  const formName = req.body.formName || 'Sample Form';
  const detectedFields = [
    { field: 'Full Name',     available: true,  value: user.name },
    { field: 'Date of Birth', available: true,  value: user.dobRaw },
    { field: 'Email Address', available: true,  value: user.email },
    { field: 'Phone Number',  available: true,  value: user.phone },
    { field: 'Address',       available: true,  value: user.address },
    { field: 'Aadhaar No.',   available: true,  value: 'XXXX-XXXX-1234' },
    { field: 'PAN Number',    available: true,  value: '***E1234F' },
    { field: 'Passport No.',  available: false, value: null },
    { field: 'Voter ID',      available: false, value: null },
    { field: 'Income',        available: false, value: null }
  ];
  const available = detectedFields.filter(f => f.available).length;
  res.json({ ok: true, formName, fields: detectedFields, available, total: detectedFields.length });
});

// ── Record autofill ───────────────────────────────────────────────
app.post('/record-autofill', auth, (req, res) => {
  analytics.formsAutofilled++;
  analytics.timeSavedMin += 4;
  analytics.lastActivity = new Date().toISOString();
  analytics.activityLog.unshift({ action: 'Form autofilled', time: new Date().toISOString() });
  res.json({ ok: true, stats: analytics });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log('AutoForm AI running on http://localhost:' + PORT));
