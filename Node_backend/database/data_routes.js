const express = require('express');
const multer = require('multer');
const { File } = require('./models'); // Adjust the path as necessary
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Set up Multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // The folder where files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Naming convention for stored files
  }
});

const upload = multer({ storage: storage });

// Define your routes here (e.g., upload-file, remove-file, get-file)

module.exports = router;

// Route to create a subscription and record the payment
router.post('/create-subscription', async (req, res) => {
  try {
    const user = await User.findById(req.body.email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a Stripe customer if the user doesn't have one
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
      });
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Create a subscription
    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [{ price: 'price_1OxVUKEcLvmdIVUArGCXyfjP' }], // Replace 'your_price_id' with your actual price ID from Stripe
      expand: ['latest_invoice.payment_intent'],
    });

    // Create a payment record
    const paymentRecord = new PaymentRecord({
      userId: user._id,
      subscriptionId: subscription.id,
      amount: subscription.plan.amount,
      status: subscription.status,
      startDate: subscription.start_date,
      // Add more fields as needed
    });
    await paymentRecord.save();

    res.json({ success: true, subscriptionId: subscription.id });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Failed to create subscription' });
  }
});

// File route for uploading a file
router.post('/upload-file', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const file = new File({
      userId: req.body.userId,
      originalFilename: req.file.originalname,
      filename: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploadDate: new Date()
    });

    await file.save();
    res.status(201).json({ message: 'File uploaded successfully', file: file });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
});

// File route for removing a file
router.delete('/remove-file/:fileId', async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete the file from the file system
    fs.unlinkSync(file.filePath);

    // Delete the file record from the database
    await file.remove();

    res.json({ message: 'File removed successfully' });
  } catch (error) {
    console.error('File removal error:', error);
    res.status(500).json({ message: 'Failed to remove file' });
  }
});

// File route for retrieving a file
router.get('/get-file/:fileId', async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.sendFile(path.resolve(file.filePath));
  } catch (error) {
    console.error('File retrieval error:', error);
    res.status(500).json({ message: 'Failed to retrieve file' });
  }
});

const express = require('express');
const Settings = require('./data_models'); // Import your settings model

// Settings update route
router.post('/update-settings', async (req, res) => {
  const { userId, defaultLanguage, tone, bodyOfLaw, output } = req.body;

  try {
    // Find user settings or create new if not exist
    const settings = await Settings.findOneAndUpdate(
      { userId },
      { defaultLanguage, tone, bodyOfLaw, output },
      { new: true, upsert: true }
    );
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
