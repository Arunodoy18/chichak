const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\d\s\+\-\(\)]+$/, 'Please provide a valid phone number']
  },
  people: {
    type: Number,
    required: [true, 'Number of people is required'],
    min: [1, 'Must have at least 1 person'],
    max: [20, 'Maximum 20 people allowed per reservation']
  },
  date: {
    type: Date,
    required: [true, 'Reservation date is required'],
    validate: {
      validator: function(v) {
        // Normalize today's date to midnight for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Normalize the input date to midnight
        const inputDate = new Date(v);
        inputDate.setHours(0, 0, 0, 0);
        
        return inputDate >= today;
      },
      message: 'Reservation date must be today or in the future'
    }
  },
  time: {
    type: String,
    required: [true, 'Reservation time is required'],
    match: [/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Please use correct HH:MM format (e.g. 18:30)']
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  }
}, {
  timestamps: true
});

// Compound index for faster querying by date and time
reservationSchema.index({ date: 1, time: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);