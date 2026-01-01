const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type:String, required:true },
  description: String,
  date: { type:Date, required:true },
  time: { type:String },
  location: { type:String },
  totalSeats: { type:Number, default:0 },
  availableSeats: { type:Number, default:0 },
  price: { type:Number, default:0 }, 
  image: { type: String }, // new field for image URL
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref:'User' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
