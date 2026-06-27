const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  event: { type: mongoose.Schema.Types.ObjectId, ref:'Event', required:true },
  tickets: { type:Number, required:true, default:1 },
  totalPrice: { type:Number, required:true, default:0 },
  department: { type:String, required:true },
  phoneNumber: { type:String, required:true },
  qrCode: { type:String },
  attended: { type:Boolean, default:false },
  paymentStatus: { type:String, default:'pending' },
  createdAt: { type:Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
