const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const bookingController = require("../controllers/bookingController");
const { isUser, isAdmin } = require("../middlewares/roleVerify");
const { getAllBookings, getUserBookings, cancelBooking } = require("../controllers/bookingController");

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management APIs
 */

/**
 * @swagger
 * /bookngo/bookings/PostBooking:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - event_id
 *               - num_tickets
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: 64e7f1234abc56789d01ef23
 *               event_id:
 *                 type: string
 *                 example: 64f8c9876def54321a09bc45
 *               num_tickets:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Booking created successfully
 *       400:
 *         description: Invalid request
 */
router.post("/PostBooking", verifyToken, isUser, bookingController.createBooking);

/**
 * @swagger
 * /bookngo/bookings/Allbookings:
 *   get:
 *     summary: Get all bookings (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings
 *       401:
 *         description: Unauthorized
 */
router.get("/Allbookings", verifyToken, isAdmin, getAllBookings);

/**
 * @swagger
 * /bookngo/bookings/IndBookings/{userId}:
 *   get:
 *     summary: Get bookings of a user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of user's bookings
 *       404:
 *         description: User not found
 */
router.get("/IndBookings/:userId", verifyToken, isUser, getUserBookings);

/**
 * @swagger
 * /bookngo/bookings/Delbookings/{id}:
 *   delete:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the booking to cancel
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       404:
 *         description: Booking not found
 */
router.delete("/Delbookings/:id", verifyToken, isUser, cancelBooking);

module.exports = router;
