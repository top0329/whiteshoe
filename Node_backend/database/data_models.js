// data_models.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  subscription: { type: Number, default: 0 }, // 0 = Not Selected, 1 = free, 2 = usage, 3 = member
  customerId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const uploadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  filename: String,
  uniqueIdentifier: String,
});

const paymentRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  date: { type: Date, default: Date.now },
});

const fileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  originalFilename: { type: String },
  filename: { type: String },
  filePath: { type: String },
  fileSize: { type: Number },
  fileType: { type: String },
  fileBits: { type: String },
  fileName: { type: String },
  uploadDate: { type: Date, default: Date.now },
});

const settingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  defaultLanguage: { type: String },
  tone: { type: String },
  bodyOfLaw: { type: [String] },
  output: { type: String },
});

const usageSchema = new mongoose.Schema({
  ipAddress: String,
  usageCount: Number,
  date: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const PaymentRecord = mongoose.model('PaymentRecord', paymentRecordSchema);
const File = mongoose.model('File', fileSchema);
const Settings = mongoose.model('Settings', settingsSchema);
const UploadFile = mongoose.model('UploadFile', uploadSchema);
const UsageHistory = mongoose.model('UsageHistory', usageSchema);
module.exports = {
  User,
  PaymentRecord,
  File,
  Settings,
  UploadFile,
  UsageHistory,
};
