const {
  fetchEvents,
  fetchEventById,
  updateEventsById,
  deleteEventById,
  fetchCategories,
} = require("../models/eventModel");
const { createEventService } = require("../services/eventService");


const {
  countAllEvents,
  countActiveEvents,
  countCancelledEvents,
} = require("../models/eventModel");
const { countAllBookings } = require("../models/booking");

exports.getAllEvents = async (req, res) => {
  try {
    console.log("Fetching all events with query from Controller");
    // Extract query parameters with defaults
    const {
      page = 1,
      limit = 8,
      title = "",
      location = "",
      event_date = "",
      category = "",
    } = req.query;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    // Validate page and limit
    if (parsedPage < 1 || parsedLimit < 1) {
      return res
        .status(400)
        .json({ message: "Page and Limit must be positive integers." });
    }

    // Fetch events from DB
    const { events, total } = await fetchEvents({
      page: parsedPage,
      limit: parsedLimit,
      title,
      location,
      event_date,
      category,
    });

    if (!events.length) {
      return res.status(404).json({ message: "No events found!" });
    }

    // Return paginated response
    res.status(200).json({
      data: events,
      page: parsedPage,
      limit: parsedLimit,
      total,
    });
  } catch (error) {
    console.error("Error in getAllEvents:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID (either integer or UUID)
    const isInteger = /^\d+$/.test(id);
    const isUUID =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
        id
      );

    if (!isInteger && !isUUID) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const event = await fetchEventById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // align with DB fields (from model JOIN query)
    const eventDTO = {
      event_id: event.event_id,
      title: event.title,
      description: event.description,
      location: event.location,
      event_date: event.event_date,
      time: event.time,
      category: event.category_name,
      category_id: event.category_id,
      image_url: event.image_url,
      capacity: event.capacity,
      available_seats: event.available_seats,
      price: event.price,
      created_at: event.created_at,
      updated_at: event.updated_at,
      created_by: event.created_by,
      updated_by: event.updated_by,
    };

    return res.status(200).json({ event: eventDTO });
  } catch (error) {
    console.error("Error in getEventById:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🔹 UPDATE Event by ID
exports.updateEventById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const {
      title,
      location,
      event_date,
      time,
      description,
      category_id,
      image_url,
      capacity,
      available_seats,
      price,
    } = req.body;

    console.log(req.body);
    // Validate all required fields
    if (
      !id ||
      !title ||
      !location ||
      !event_date ||
      !time ||
      !description ||
      !category_id ||
      !image_url ||
      capacity === undefined ||
      available_seats === undefined ||
      price === undefined
    ) {
      return res
        .status(400)
        .json({ error: "Invalid Event ID or missing/invalid fields" });
    }

    const updatedEvent = await updateEventsById(id, {
      title,
      location,
      event_date,
      time,
      description,
      category_id,
      image_url,
      capacity,
      available_seats,
      price,
    });

    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res
      .status(200)
      .json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    console.error("Error in updateEventById:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🔹 DELETE Event by ID
exports.deleteEventById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedEvent = await deleteEventById(id);

    if (!deletedEvent) {
      return res
        .status(404)
        .json({ message: "Event not found or already deleted" });
    }

    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const user_id = req.user_id;
    const role = req.user.role;

    if (role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: only admins can create new events" });
    }

    const {
      title,
      state_id,
      city_id,
      location,
      event_date,
      time,
      description,
      category_id,
      image_url,
      capacity,
      price,
    } = req.body;

    if (
      !title ||
      !state_id ||
      !city_id ||
      !location ||
      !event_date ||
      !time ||
      !description ||
      !category_id ||
      !image_url ||
      !capacity ||
      !price
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (
      isNaN(capacity) ||
      capacity <= 0 ||
      isNaN(price) ||
      price < 0 ||
      isNaN(Date.parse(event_date)) ||
      !city_id ||
      !state_id
    ) {
      return res.status(400).json({ message: "Invalid Data format" });
    }

    const eventData = {
      title,
      state_id: parseInt(state_id),
      city_id: parseInt(city_id),
      location,
      event_date,
      time,
      description,
      category_id,
      image_url,
      capacity,
      available_seats: capacity,
      price,
      created_by: user_id,
      updated_by: user_id,
    };

    const eventDTO = await createEventService(eventData);
    res.status(201).json({
      message: "Event created successfully",
      event: eventDTO,
    });
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  }
};

exports.getEventStats = async (req, res) => {
  try {
    const totalEvents = await countAllEvents();
    const activeEvents = await countActiveEvents();
    const cancelledEvents = await countCancelledEvents();
    const totalBookings = await countAllBookings();

    const statsResponse = {
      total_events: totalEvents,
      active_events: activeEvents,
      cancelled_events: cancelledEvents,
      total_bookings: totalBookings,
    };

    res.status(200).json(statsResponse);
  } catch (error) {
    console.error("Error in getEventStats:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    console.log("Fetching all categories from controller");

    const { page = 1, limit = 50, name = "" } = req.query;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    if (parsedPage < 1 || parsedLimit < 1) {
      return res.status(400).json({
        message: "Page and Limit must be positive integers.",
      });
    }

    const { categories, total } = await fetchCategories({
      page: parsedPage,
      limit: parsedLimit,
      name,
    });

    if (!categories.length) {
      return res.status(404).json({ message: "No Categories found !" });
    }

    res.status(200).json({
      data: categories,
      page: parsedPage,
      limit: parsedLimit,
      total,
    });
  } catch (error) {
    console.error("Error is getAllCategoreis: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
