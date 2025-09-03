const { fetchEventById } = require("../models/eventModel");
const { createBooking, fetchBookingsByUser } = require("../models/booking");
const { fetchAllBookings, updateAvailableSeats } = require("../models/booking");
const { updateBookingStatus, fetchBookingId } = require("../models/booking");

exports.createBooking = async (req, res) => {
  try {
    const { user_id, event_id, num_tickets } = req.body;

    // validate required fields
    if (!user_id || !event_id || !num_tickets) {
      return res.status(400).json({
        message: "user_id, event_id, and num_tickets are required.",
      });
    }

    // fetch event price
    const event = await fetchEventById(event_id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.available_seats < num_tickets) {
      throw new Error("Not enough seats available");
    }

    // calculate total amount
    const total_amount = event.price * num_tickets;

    // default booking status
    const status = req.body.status || "pending";

    // call model
    const booking = await createBooking({
      user_id,
      event_id,
      num_tickets,
      total_amount,
      status,
      created_by: user_id,
      updated_by: user_id,
      is_active: true,
    });

    await updateAvailableSeats(event_id, event.available_seats - num_tickets);

    return res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // extract query params
    const {
      search,
      status,
      sort = "booking_date",
      order = "DESC",
      page = 1,
      limit = 10,
    } = req.query;

    const { bookings, totalCount } = await fetchAllBookings({
      search,
      status,
      sort,
      order,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    if (!bookings.length) {
      return res
        .status(404)
        .json({ status: "fail", message: "No Bookings found" });
    }

    const simplifiedBookings = bookings.map((b) => ({
      booking_id: b.booking_id,
      booking_date: b.booking_date,
      num_tickets: b.num_tickets,
      total_amount: b.total_amount,
      status: b.status,
      user: {
        username: b.name,
        email: b.email,
      },
      event: {
        title: b.event_title,
        location: b.event_location,
        event_date: b.event_date,
      },
    }));

    return res.status(200).json({
      status: "Success",
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      data: simplifiedBookings,
    });
  } catch (error) {
    console.error("Error Fetching Bookings", error);
    return res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (req.user.user_id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // --- Query Params ---
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const search = req.query.search || ""; 
    const filter = req.query.filter || "";
    const sortBy = req.query.sortBy || "booking_date";
    const sortOrder = req.query.sortOrder === "desc" ? "DESC" : "ASC";

    const offset = (page - 1) * limit;

    // Fetch bookings with all params
    const { bookings, totalCount } = await fetchBookingsByUser({
      user_id: userId,
      search,
      filter,
      sortBy,
      sortOrder,
      limit,
      offset,
    });

    if (!bookings.length) {
      return res
        .status(404)
        .json({ status: "fail", message: "No bookings found" });
    }

    const simplifiedBookings = bookings.map((b) => ({
      booking_id: b.booking_id,
      bookind_date: b.booking_date,
      num_tickets: b.num_tickets,
      total_amount: b.total_amount,
      status: b.status,
      event: {
        title: b.event_title,
        location: b.event_location,
        event_date: b.event_date,
      },
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      status: "Success",
      date: simplifiedBookings,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching user bookings", error);
    return res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id, 10);

    const booking = await fetchBookingId(bookingId);

    if (!booking) {
      return res.status(400).json({ message: "Booking Not Found" });
    }

    if (req.user.user_id !== booking.user_id && req.user.role != "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedBooking = await updateBookingStatus(bookingId);

    return res.status(200).json({
      status: "Success",
      message: "Booking Cancelled Successfully",
      booking_id: updatedBooking.booking_id,
      status: updatedBooking.status,
    });
  } catch (error) {
    console.error("Error cancelling Booking:", error);
    return res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};
