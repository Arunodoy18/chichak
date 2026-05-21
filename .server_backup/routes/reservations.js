const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

const adminAuth = (req, res, next) => {
  const password = req.headers['x-admin-password'] || req.query.password;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ success: false, error: 'Server misconfiguration: ADMIN_PASSWORD not set.' });
  }

  if (password === adminPassword) {
    next();
  } else {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
};

// @route   POST /api/reservations
// @desc    Create a new reservation
router.post('/', async (req, res, next) => {
  try {
    const reservation = await Reservation.create(req.body);
    return res.status(201).json({ success: true, reservation });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    next(error);
  }
});

// @route   GET /api/reservations
// @desc    Get all reservations
router.get('/', adminAuth, async (req, res, next) => {
  try {
    const reservations = await Reservation.find().sort({ date: 1, time: 1 });
    return res.status(200).json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/reservations/:id
// @desc    Get a single reservation
router.get('/:id', adminAuth, async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }
    return res.status(200).json({ success: true, reservation });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/reservations/:id/status
// @desc    Update reservation status
router.patch('/:id/status', adminAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    return res.status(200).json({ success: true, reservation });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/reservations/:id
// @desc    Delete a reservation
router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }
    return res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
});

module.exports = router;