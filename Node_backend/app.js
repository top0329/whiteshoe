require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const requestIp = require('request-ip');
const { OAuth2Client } = require('google-auth-library');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  Settings,
  User,
  UploadFile,
  UsageHistory,
} = require('./database/data_models');
const requestIP = require('request-ip');

const app = express();
const client = new OAuth2Client();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(requestIp.mw());
app.use(express.json());

// Connect to MongoDB
const connectToMongoDB = async () => {
  try {
    console.log(
      'Attempting to connect to MongoDB with certificate authentication'
    );
    const certPath = path.resolve(__dirname, process.env.MONGODB_CERT_PATH);
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
      tls: true,
      tlsCAFile: certPath,
      tlsAllowInvalidCertificates: true,
    });
    console.log('Connected to MongoDB successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
};

connectToMongoDB();

// Test route to check MongoDB connection
app.get('/api/test-db', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (error) {
    console.error('MongoDB query error:', error.message);
    res.status(500).json({ error: 'Failed to connect to MongoDB' });
  }
});

// Test route to check backend connection
app.get('/api/test', (req, res) => {
  res.send('Backend connected');
});

// Route to get IP and usage count
app.get('/api/get-ip', async (req, res) => {
  try {
    const ipAddress = requestIP.getClientIp(req);
    console.log('Client IP: ', ipAddress);
    const usage = (await UsageHistory.findOne({ ipAddress })) || {
      usageCount: 0,
    };
    console.log({ usage });
    res.json({ ipAddress, usageCount: usage.usageCount });
  } catch (error) {
    console.error('Error fetching IP and usage count:', error.message);
    res.status(500).json({ error: 'Failed to get IP and usage count' });
  }
});

// Route to increment usage count
app.post('/api/increment-usage', async (req, res) => {
  try {
    const { ip } = req.body;
    console.log({ ip });
    let usage = await UsageHistory.findOne({ ipAddress: ip });
    if (!usage) {
      usage = new UsageHistory({ ipAddress: ip, usageCount: 1 });
    } else {
      usage.usageCount += 1;
    }
    await usage.save();
    res.json({ message: 'Usage count incremented' });
  } catch (error) {
    console.error('Error incrementing usage count:', error.message);
    res.status(500).json({ error: 'Failed to increment usage count' });
  }
});

// Placeholder for reviews endpoint
app.get('/api/reviews', (req, res) => {
  res.status(200).json({ reviews: [] });
});

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    const defaultSettings = new Settings({
      userId: user._id,
      defaultLanguage: 'English',
      tone: 'professional',
      bodyOfLaw: [],
      output: 'short',
    });
    await defaultSettings.save();
    const token = jwt.sign(
      { email: user.email, userId: user._id, subscription: user.subscription },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ success: false, message: 'Signup failed.' });
  }
});

// Serve Google Client ID
app.get('/config', (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID });
});

// Google Authentication Endpoint
app.post('/google-auth', async (req, res) => {
  const { token, clientId } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    const { email, sub: googleId } = payload;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, googleId });
      await user.save();
      const defaultSettings = new Settings({
        userId: user._id,
        defaultLanguage: 'English',
        tone: 'professional',
        bodyOfLaw: [],
        output: 'short',
      });
      await defaultSettings.save();
    }
    const jwtToken = jwt.sign(
      { email: user.email, userId: user._id, subscription: user.subscription },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.status(200).json({ success: true, token: jwtToken });
  } catch (error) {
    console.error('Google authentication error:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Google authentication failed' });
  }
});

// Login Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res
        .status(401)
        .json({ success: false, message: 'User not found' });
    }
    if (!user.password) {
      return res
        .status(401)
        .json({ success: false, message: 'Google Signin User!' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Incorrect password' });
    }
    const token = jwt.sign(
      { email: user.email, userId: user._id, subscription: user.subscription },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Verify JWT token
app.post('/verify-token', async (req, res) => {
  const { token } = req.body;
  try {
    jwt.verify(token, process.env.JWT_SECRET_KEY);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Token verification error:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Token verification failed' });
  }
});

// Password change endpoint
app.post('/change-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error.message);
    if (error.message === 'jwt expired') {
      return res.status(500).json({
        success: false,
        message: 'Your session has expired. Please login again.',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Subscription endpoint
app.post('/subscribe', async (req, res) => {
  const { token, plan } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token is missing. Please sign in again.',
    });
  }

  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found.' });
    }
    if (!user.customerId) {
      console.log('No customerId');
      const customer = await stripe.customers.create({ email });
      user.customerId = customer.id;
    }

    let priceId;
    let subscription;
    switch (plan) {
      case 'usage':
        priceId = process.env.USAGE_PRICE_ID;
        subscription = 2;
        break;
      case 'member':
        priceId = process.env.MEMBER_PRICE_ID;
        subscription = 3;
        break;
      case 'free':
        priceId = null;
        user.subscription = 1;
        break;
      default:
        break;
    }

    await user.save();

    const jwtToken = jwt.sign(
      { email: user.email, userId: user._id, subscription: user.subscription },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    if (plan === 'free') {
      console.log('Free plan');
      return res.status(200).json({ success: true, token: jwtToken });
    }

    console.log('priceId => ', priceId);

    const line_item =
      plan == 'usage' ? { price: priceId } : { price: priceId, quantity: 1 };

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [line_item],
      metadata: {
        subscription,
        email,
      },
      success_url: `${process.env.FRONTEND_URL}/subscription`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription`,
    });

    console.log({ session });

    res.status(200).json({ success: true, token: jwtToken, session });
  } catch (error) {
    console.error('Subscription error:', error.message);
    if (error.message === 'jwt expired') {
      return res.status(500).json({
        success: false,
        message: 'Your session has expired. Please login again.',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/update-token', async (req, res) => {
  const { token } = req.body;
  console.log({ token });
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token is missing. Please sign in again.',
    });
  }

  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found.' });
    }
    const jwtToken = jwt.sign(
      { email: user.email, userId: user._id, subscription: user.subscription },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.status(200).json({ success: true, token: jwtToken });
  } catch (err) {
    console.error('Update token error:', error.message);
    if (error.message === 'jwt expired') {
      return res.status(500).json({
        success: false,
        message: 'Your session has expired. Please login again.',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Stripe webhook endpoint
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const payload = req.body;
      if (payload.type === 'checkout.session.completed') {
        const session = payload.data.object;
        if (session.payment_status === 'paid') {
          const { subscription, email } = session.metadata;
          const user = await User.findOne({ email });
          user.subscription = subscription;
          console.log({ user });
          await user.save();
        }
      }
    } catch (err) {
      console.error('Webhook Error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    res.status(200).json({ received: true });
  }
);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

// Initialize upload
const upload = multer({ storage: storage }).single('file');

// Upload file endpoint
app.post('/upload-file', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.userId;
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      } else {
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        } else {
          const upload = new UploadFile({
            userId: userId,
            filename: req.file.filename,
            uniqueIdentifier: req.file.filename,
          });
          await upload.save();
          return res.json({
            message: 'File uploaded successfully',
            filename: req.file.filename,
          });
        }
      }
    });
  } catch (error) {
    console.error('File upload error:', error.message);
    if (error.message === 'jwt expired') {
      return res.status(500).json({
        success: false,
        message: 'Your session has expired. Please login again.',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get all files endpoint
app.post('/get-all-files', async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.userId;
    const files = await UploadFile.find({ userId });
    res.status(200).json({ success: true, files });
  } catch (error) {
    console.error('Get files error:', error.message);
    if (error.message === 'jwt expired') {
      return res.status(500).json({
        success: false,
        message: 'Your session has expired. Please login again.',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete file endpoint
app.delete('/delete-file/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    await UploadFile.findByIdAndDelete(fileId);
    res
      .status(200)
      .json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error.message);
    if (error.message === 'jwt expired') {
      return res.status(500).json({
        success: false,
        message: 'Your session has expired. Please login again.',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Reading file data
app.get('/readFile/:fileId', (req, res) => {
  const { fileId } = req.params;
  const filePath = path.join(__dirname, '/uploads', fileId);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send({ message: 'File not found' });
    }
    let dataBuffer = fs.readFileSync(filePath);
    pdf(dataBuffer)
      .then(function (data) {
        res.send({ content: data.text });
      })
      .catch((err) => {
        console.error('Error parsing PDF:', err.message);
        res.status(500).send({ message: 'Failed to parse PDF' });
      });
  });
});

// Email change endpoint
app.post('/change-email', async (req, res) => {
  const { token, newEmail } = req.body;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    user.email = newEmail;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: 'Email changed successfully' });
  } catch (error) {
    console.error('Change email error:', error.message);
    if (error.message === 'jwt expired') {
      return res.status(500).json({
        success: false,
        message: 'Your session has expired. Please login again.',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Payment records endpoint
app.post('/paymentRecords', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token is missing. Please sign in again.',
    });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    const subscriptions = await stripe.subscriptions.list({
      customer: user.customerId,
      status: 'all',
    });
    res.status(200).json({ success: true, subscriptions });
  } catch (error) {
    console.error('Payment records error:', error.message);
    if (error.message === 'jwt expired') {
      return res.status(500).json({
        success: false,
        message: 'Your session has expired. Please login again.',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Save settings endpoint
app.put('/settings', async (req, res) => {
  const { token, defaultLanguage, tone, bodyOfLaw, output } = req.body;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Token is missing.' });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.userId;
    let settings = await Settings.findOne({ userId });
    if (!settings) {
      settings = new Settings({
        userId,
        defaultLanguage,
        tone,
        bodyOfLaw,
        output,
      });
    } else {
      settings.defaultLanguage = defaultLanguage;
      settings.tone = tone;
      settings.bodyOfLaw = bodyOfLaw;
      settings.output = output;
    }
    await settings.save();
    res.status(200).json({
      success: true,
      message: 'Settings saved successfully.',
      settings,
    });
  } catch (error) {
    console.error('Save settings error:', error.message);
    if (error.message === 'jwt expired') {
      return res.status(500).json({
        success: false,
        message: 'Your session has expired. Please login again.',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get settings endpoint
app.post('/get-settings', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Token is missing.' });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.userId;
    const settings = await Settings.findOne({ userId });
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings are not existed for this user.',
      });
    }
    console.log({ settings });
    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('Get settings error:', error.message);
    if ((error.message === 'jwt expired') | (error.message === 'invalid token')) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Save chat endpoint
app.post('/save-chat', async (req, res) => {
  const { token, chat } = req.body;
})

// Log token usage
app.post('/log-token-usage', async (req, res) => {
  const { token, tokensUsed } = req.body;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Token is missing.' });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.userId;
    const usageRecord = new UsageHistory({
      date: new Date(),
      userId: userId,
      tokens: tokensUsed,
      charges: tokensUsed * 0.0001,
    });
    await usageRecord.save();
    res
      .status(200)
      .json({ success: true, message: 'Token usage logged successfully.' });
  } catch (error) {
    console.error('Log token usage error:', error.message);
    if (error.message === 'jwt expired') {
      return res.status(500).json({
        success: false,
        message: 'Your session has expired. Please login again.',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Fetch usage history
app.get('/api/usage-history', async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Token is missing.' });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.userId;
    const usageHistory = await UsageHistory.find({ userId });
    res.status(200).json({ success: true, usageHistory });
  } catch (error) {
    console.error('Get usage history error:', error.message);
    if (error.message === 'jwt expired') {
      return res.status(500).json({
        success: false,
        message: 'Your session has expired. Please login again.',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Fetch subscription details
app.get('/subscription-details', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Token is missing.' });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decodedToken.userId);
    const subscription = await stripe.subscriptions.retrieve(
      user.subscriptionId
    );
    res.status(200).json({ success: true, subscription });
  } catch (error) {
    console.error('Get subscription details error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Change subscription
app.post('/change-subscription', async (req, res) => {
  const { token, plan } = req.body;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Token is missing.' });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decodedToken.userId);
    await stripe.subscriptions.update(user.subscriptionId, {
      items: [
        {
          id: user.subscriptionItemId,
          price: plan,
        },
      ],
    });
    res
      .status(200)
      .json({ success: true, message: 'Subscription changed successfully.' });
  } catch (error) {
    console.error('Change subscription error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel subscription
app.post('/cancel-subscription', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Token is missing.' });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decodedToken.userId);
    await stripe.subscriptions.del(user.subscriptionId);
    res
      .status(200)
      .json({ success: true, message: 'Subscription cancelled successfully.' });
  } catch (error) {
    console.error('Cancel subscription error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get daily token usage
app.get('/daily-token-usage', async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Token is missing.' });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const usageRecords = await UsageHistory.find({
      userId,
      date: { $gte: today },
    });
    const dailyTokenUsage = usageRecords.reduce(
      (total, record) => total + record.tokens,
      0
    );
    res.status(200).json({ success: true, dailyTokenUsage });
  } catch (error) {
    console.error('Get daily token usage error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Fetch usage records
app.get('/usageRecords', async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Token is missing.' });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.userId;
    const usageRecords = await UsageHistory.find({ userId });
    res.status(200).json({ success: true, usage: usageRecords });
  } catch (error) {
    console.error('Get usage records error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Log token usage to Stripe
const logTokenUsage = async (customerId, tokensUsed, eventName) => {
  try {
    await stripe.reporting.reportRuns.create({
      report_type: 'usage',
      parameters: {
        customer: customerId,
        usage: tokensUsed,
        event: eventName,
      },
    });
    console.log('Meter event logged');
  } catch (error) {
    console.error('Error logging meter event:', error.message);
  }
};

// Work page endpoint
app.post('/work', async (req, res) => {
  const { prompt, userId, tokenCount } = req.body;
  try {
    const user = await User.findById(userId);
    let eventName = 'usageonly';
    if (user.subscriptionType === 'member') {
      eventName = 'memberusage';
    }
    await logTokenUsage(user.customerId, tokenCount, eventName);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Work page error:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Work page processing failed' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
