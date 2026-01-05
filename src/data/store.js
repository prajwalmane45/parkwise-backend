// src/data/store.js
// Shared in-memory stores for prototyping (to be replaced by DB later)
const users = [];       // used by authController (if you want)
const parkingLots = []; // used by parkingController
const bookings = [];    // used by bookingController

module.exports = { users, parkingLots, bookings };
