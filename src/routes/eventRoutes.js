const express = require("express");
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  updateEventById,
  deleteEventById,
  createEvent,
  getEventStats,
  getAllCategories,
} = require("../controllers/eventController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/roleVerify");

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management APIs
 */

/**
 * @swagger
 * /bookngo/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of events
 */
router.get("/", getAllEvents);

/**
 * @swagger
 * /bookngo/events/admin/stats:
 *   get:
 *     summary: Get event statistics (Admin only)
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Event statistics
 */
router.get("/admin/stats", getEventStats);

/**
 * @swagger
 * /bookngo/events/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/categories", getAllCategories);

/**
 * @swagger
 * /bookngo/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get("/:id", getEventById);

/**
 * @swagger
 * /bookngo/events/{id}:
 *   put:
 *     summary: Update event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Music Concert
 *               location:
 *                 type: string
 *                 example: Chennai
 *               description:
 *                 type: string
 *                 example: A live music concert event
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       404:
 *         description: Event not found
 */
router.put("/:id", updateEventById);

/**
 * @swagger
 * /bookngo/events/{id}:
 *   delete:
 *     summary: Delete event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 */
router.delete("/:id", deleteEventById);

/**
 * @swagger
 * /bookngo/events/createEvent:
 *   post:
 *     summary: Create a new event (Admin only)
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - location
 *               - event_date
 *             properties:
 *               title:
 *                 type: string
 *                 example: Tech Meetup
 *               location:
 *                 type: string
 *                 example: Bangalore
 *               event_date:
 *                 type: string
 *                 example: 2025-09-15
 *               description:
 *                 type: string
 *                 example: A meetup for developers
 *               category:
 *                 type: string
 *                 example: Technology
 *               capacity:
 *                 type: integer
 *                 example: 200
 *               price:
 *                 type: number
 *                 example: 499.99
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Invalid request
 */
router.post("/createEvent", verifyToken, isAdmin, createEvent);

module.exports = router;
