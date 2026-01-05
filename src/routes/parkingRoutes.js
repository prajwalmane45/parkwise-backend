const express = require('express');
const router = express.Router();

const {
  addParkingLot,
  getAllParkingLots,
  updateParkingLot,
  deleteParkingLot
} = require('../controllers/parkingController');

const verifyToken = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');


router.get('/', getAllParkingLots);

/*
  🔒 ADMIN ONLY ROUTES
*/
router.post('/add', verifyToken, authorizeRole('admin'), addParkingLot);
router.put('/:id', verifyToken, authorizeRole('admin'), updateParkingLot);
router.delete('/:id', verifyToken, authorizeRole('admin'), deleteParkingLot);

module.exports = router;
