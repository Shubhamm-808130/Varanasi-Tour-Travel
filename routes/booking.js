const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Helper to generate reference code
const generateRefCode = (prefix = 'KASHI') => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-2026-${randomNum}`;
};

// Helper to check real-time vehicle availability for a date
const getVehicleAvailability = async (vehicleId, totalStock, travelDate) => {
  const stock = totalStock || 3;
  let booked = 0;
  if (travelDate) {
    const countRow = await db.get(
      `SELECT COUNT(*) as count FROM bookings 
       WHERE vehicle_id = ? 
         AND service_date LIKE ? 
         AND booking_status NOT IN ('CANCELLED', 'COMPLETED')`,
      [vehicleId, `%${travelDate}%`]
    );
    booked = countRow ? countRow.count : 0;
  }
  const available = Math.max(0, stock - booked);
  return { total: stock, booked, available, isAvailable: available > 0 };
};

// 0. VEHICLE AVAILABILITY & STOCK CHECKER (REAL-TIME)
router.get('/availability', async (req, res, next) => {
  try {
    const travelDate = req.query.date || '';
    const vehicles = await db.all('SELECT id, name, category, total_quantity FROM vehicles ORDER BY local_base_rate ASC');
    const result = {};

    for (const v of vehicles) {
      const avail = await getVehicleAvailability(v.id, v.total_quantity, travelDate);
      result[v.id] = { name: v.name, ...avail };
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. CAR BOOKING FORM
router.get('/car', async (req, res, next) => {
  try {
    const [vehicles, attractions, hotels] = await Promise.all([
      db.all('SELECT * FROM vehicles ORDER BY local_base_rate ASC'),
      db.all('SELECT * FROM attractions ORDER BY distance_km ASC'),
      db.all('SELECT * FROM hotels ORDER BY price_per_night ASC')
    ]);

    const selectedVehicleId = req.query.vehicle_id || (vehicles[0] ? vehicles[0].id : null);
    const selectedDestination = req.query.destination || '';
    const selectedDate = req.query.travel_date || '';
    const selectedTripType = req.query.trip_type || 'local';

    const availabilityMap = {};
    for (const v of vehicles) {
      availabilityMap[v.id] = await getVehicleAvailability(v.id, v.total_quantity, selectedDate);
    }

    res.render('car_booking', {
      title: 'Book A Car / Taxi in Varanasi | Instant Fare Estimate',
      activePage: 'car',
      vehicles,
      attractions,
      hotels,
      availabilityMap,
      selectedVehicleId,
      selectedDestination,
      selectedDate,
      selectedTripType
    });
  } catch (err) {
    next(err);
  }
});

// 2. SUBMIT CAR BOOKING
router.post('/car', async (req, res, next) => {
  try {
    const {
      trip_type,
      vehicle_id,
      include_hotel,
      combo_hotel_id,
      combo_hotel_nights,
      service_date,
      pickup_time,
      pickup_location,
      pickup_coords,
      drop_location,
      customer_name,
      customer_phone,
      customer_email,
      passengers,
      notes,
      total_amount,
      payment_choice
    } = req.body;

    // Safety validation: Check if vehicle is available on this service_date
    const vehicle = await db.get('SELECT * FROM vehicles WHERE id = ?', [vehicle_id]);
    const avail = await getVehicleAvailability(vehicle_id, vehicle ? vehicle.total_quantity : 3, service_date);
    const totalStock = avail.total;

    if (!avail.isAvailable) {
      return res.status(400).send(`
        <div style="font-family: sans-serif; text-align: center; padding: 60px 20px; max-width: 600px; margin: 0 auto;">
          <div style="font-size: 54px; margin-bottom: 15px;">🚗❌</div>
          <h2 style="color: #ef4444; margin-bottom: 10px;">Cab Model Fully Booked!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">
            All <strong>${totalStock} ${vehicle ? vehicle.name : 'cabs'}</strong> are completely booked for <strong>${service_date}</strong>.
          </p>
          <p style="color: #64748b; font-size: 14px;">
            Please choose another available vehicle model (such as Ertiga or Innova) or select another date slot.
          </p>
          <a href="/booking/car?travel_date=${service_date}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #0c2340; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Choose Another Available Vehicle
          </a>
        </div>
      `);
    }

    let selectedPlaces = req.body.selected_places;
    if (Array.isArray(selectedPlaces)) {
      selectedPlaces = selectedPlaces.join(', ');
    } else if (!selectedPlaces) {
      selectedPlaces = 'Local Varanasi Tour';
    }

    const bookingRef = generateRefCode('CAB');
    const paymentStatus = payment_choice === 'PAID_MOCK' ? 'PAID_MOCK' : 'PAY_ON_ARRIVAL';
    const amount = parseFloat(total_amount) || 2200;

    const hasHotel = include_hotel === '1' && combo_hotel_id;
    const bookingType = hasHotel ? 'CAR_HOTEL_COMBO' : 'CAR_RENTAL';
    const hotelId = hasHotel ? parseInt(combo_hotel_id) : null;
    const comboNote = hasHotel 
      ? `[COMBO BOOKING] Cab + Hotel for ${combo_hotel_nights || 1} Night(s). ${notes || ''}`
      : (notes || '');

    await db.run(
      `INSERT INTO bookings (booking_ref, booking_type, customer_name, customer_email, customer_phone, service_date, pickup_location, pickup_coords, drop_location, vehicle_id, hotel_id, passengers, selected_attractions, total_amount, payment_status, booking_status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?)`,
      [
        bookingRef,
        bookingType,
        customer_name,
        customer_email,
        customer_phone,
        `${service_date} (${pickup_time || '09:00 AM'})`,
        pickup_location,
        pickup_coords || null,
        drop_location,
        vehicle_id,
        hotelId,
        passengers || 2,
        selectedPlaces,
        amount,
        paymentStatus,
        comboNote
      ]
    );

    res.redirect(`/booking/success/${bookingRef}`);
  } catch (err) {
    next(err);
  }
});

// 3. HOTEL BOOKING FORM
router.get('/hotel', async (req, res, next) => {
  try {
    const [hotels, vehicles] = await Promise.all([
      db.all('SELECT * FROM hotels ORDER BY price_per_night ASC'),
      db.all('SELECT * FROM vehicles ORDER BY airport_transfer_rate ASC')
    ]);
    res.render('hotel_booking', {
      title: 'Varanasi Hotels Booking | Ghat-side & Temple Proximity Stays',
      activePage: 'hotel',
      hotels,
      vehicles
    });
  } catch (err) {
    next(err);
  }
});

// 4. SUBMIT HOTEL BOOKING
router.post('/hotel', async (req, res, next) => {
  try {
    const {
      hotel_id,
      include_cab,
      combo_vehicle_id,
      cab_pickup_point,
      pickup_coords,
      service_date,
      nights,
      passengers,
      customer_name,
      customer_phone,
      customer_email,
      total_amount,
      payment_choice
    } = req.body;

    const bookingRef = generateRefCode('HTL');
    const paymentStatus = payment_choice === 'PAID_MOCK' ? 'PAID_MOCK' : 'PAY_AT_HOTEL';
    const amount = parseFloat(total_amount) || 2800;

    const hasCab = include_cab === '1' && combo_vehicle_id;
    const bookingType = hasCab ? 'CAR_HOTEL_COMBO' : 'HOTEL';
    const vehicleId = hasCab ? parseInt(combo_vehicle_id) : null;
    const comboNote = hasCab 
      ? `[COMBO BOOKING] Hotel + Cab Pickup from: ${cab_pickup_point || 'Station / Airport'}`
      : `Room booking for ${nights || 1} night(s)`;

    await db.run(
      `INSERT INTO bookings (booking_ref, booking_type, customer_name, customer_email, customer_phone, service_date, pickup_location, pickup_coords, hotel_id, vehicle_id, passengers, total_amount, payment_status, booking_status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?)`,
      [
        bookingRef,
        bookingType,
        customer_name,
        customer_email,
        customer_phone,
        `${service_date} (${nights || 1} Night(s))`,
        hasCab ? (cab_pickup_point || 'Station / Airport Pickup') : 'Direct Hotel Check-in',
        pickup_coords || null,
        hotel_id,
        vehicleId,
        passengers || 2,
        amount,
        paymentStatus,
        comboNote
      ]
    );

    res.redirect(`/booking/success/${bookingRef}`);
  } catch (err) {
    next(err);
  }
});

// 5. BOOKING SUCCESS RECEIPT
router.get('/success/:ref', async (req, res, next) => {
  try {
    const booking = await db.get(
      `SELECT b.*, v.name as vehicle_name, h.name as hotel_name 
       FROM bookings b
       LEFT JOIN vehicles v ON b.vehicle_id = v.id
       LEFT JOIN hotels h ON b.hotel_id = h.id
       WHERE b.booking_ref = ?`,
      [req.params.ref]
    );

    if (!booking) {
      return res.status(404).send('Booking reference not found');
    }

    res.render('booking_success', {
      title: `Booking Confirmed #${booking.booking_ref}`,
      booking
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
