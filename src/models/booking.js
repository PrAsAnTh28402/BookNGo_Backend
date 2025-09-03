const db = require('../config/database');

exports.createBooking = async ({ user_id, event_id, num_tickets, total_amount, status, created_by, updated_by }) => {
  try {
    const query = `
      INSERT INTO bookings (
        user_id, event_id, num_tickets, total_amount, status, created_at, updated_at,
        created_by, updated_by
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6,$7)
      RETURNING *
    `;

    const values = [user_id, event_id, num_tickets, total_amount, status,created_by,updated_by];
    const { rows } = await db.query(query, values);

    return rows[0];
  } catch (error) {
    throw error;
  }
};

exports.updateAvailableSeats = async (event_id, newSeats) => {
  try {
    const query = `
      UPDATE events
      SET available_seats = $1, updated_at = NOW()
      WHERE event_id = $2
      RETURNING *
    `;
    const values = [newSeats, event_id];
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (error) {
    throw error;
  }
};


exports.findBookingById = async (booking_id) => {
  try {
    const query = `SELECT * FROM bookings WHERE booking_id = $1`;
    const { rows } = await db.query(query, [booking_id]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};


exports.fetchAllBookings = async ({ search, status, sort, order, page, limit }) => {
  let baseQuery = `
    SELECT b.booking_id,
           b.booking_date,
           b.num_tickets,
           b.total_amount,
           b.status,
           u.name,
           u.email,
           e.title AS event_title,
           e.location AS event_location,
           e.event_date
    FROM bookings b
    JOIN users u ON b.user_id = u.user_id
    JOIN events e ON b.event_id = e.event_id
  `;

  const conditions = [];
  const values = [];
  let paramIndex = 1;

  // filter by status
  if (status) {
    conditions.push(`b.status = $${paramIndex++}`);
    values.push(status);
  }

  // search
  if (search) {
    conditions.push(`(
      LOWER(u.name) LIKE LOWER($${paramIndex})
      OR LOWER(u.email) LIKE LOWER($${paramIndex})
      OR LOWER(e.title) LIKE LOWER($${paramIndex})
      OR LOWER(e.location) LIKE LOWER($${paramIndex})
    )`);
    values.push(`%${search}%`);
    paramIndex++;
  }

  if (conditions.length > 0) {
    baseQuery += " WHERE " + conditions.join(" AND ");
  }

  // sorting
  const validSort = ["booking_date", "event_date", "status", "total_amount"];
  const sortBy = validSort.includes(sort) ? sort : "booking_date";
  const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
  baseQuery += ` ORDER BY ${sortBy} ${sortOrder}`;

  // pagination
  const offset = (page - 1) * limit;
  const paginatedQuery = `${baseQuery} LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
  values.push(limit, offset);

  const { rows } = await db.query(paginatedQuery, values);

  // get total count for pagination
  let countQuery = `
    SELECT COUNT(*) AS total
    FROM bookings b
    JOIN users u ON b.user_id = u.user_id
    JOIN events e ON b.event_id = e.event_id
  `;
  if (conditions.length > 0) {
    countQuery += " WHERE " + conditions.join(" AND ");
  }

  const { rows: countRows } = await db.query(countQuery, values.slice(0, values.length - 2));
  const totalCount = parseInt(countRows[0].total, 10);

  return { bookings: rows, totalCount };
};



exports.fetchBookingsByUser = async ({
  user_id,
  search,
  filter,
  sortBy,
  sortOrder,
  limit,
  offset
}) => {

  // Base query
  let query = `
    SELECT 
      b.booking_id, b.booking_date, b.num_tickets,
      b.total_amount, b.status, e.title as event_title,
      e.location as event_location, e.event_date
    FROM bookings b
    JOIN events e ON b.event_id = e.event_id
    WHERE b.user_id = $1
  `;

  const params = [user_id];
  let paramIndex = 2;

  // Search (title or location)
  if (search) {
    query += ` AND (LOWER(e.title) LIKE $${paramIndex} OR LOWER(e.location) LIKE $${paramIndex}) `;
    params.push(`%${search.toLowerCase()}%`);
    paramIndex++;
  }

  // Filter by status
  if (filter) {
    query += ` AND b.status = $${paramIndex} `;
    params.push(filter);
    paramIndex++;
  }

  // Sorting
  const allowedSortFields = ["booking_date", "event_date", "num_tickets"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "booking_date";
  query += ` ORDER BY ${sortField} ${sortOrder} `;

  // Pagination
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1} `;
  params.push(limit, offset);

  const { rows } = await db.query(query, params);

  // Get total count for pagination
  const countQuery = `SELECT COUNT(*) FROM bookings b JOIN events e ON b.event_id = e.event_id WHERE b.user_id = $1`;
  const countResult = await db.query(countQuery, [user_id]);
  const totalCount = parseInt(countResult.rows[0].count, 10);

  return { bookings: rows, totalCount };
};


exports.fetchBookingId=async(booking_id)=>{
  const query=`select * from bookings
  where booking_id=$1`;
  const {rows}=await db.query(query,[booking_id]);
  return rows[0];
};

exports.updateBookingStatus= async(booking_id)=>{
  const query=`update bookings
  set status='cancelled', updated_at=Now()
  where booking_id=$1
  returning booking_id,status`;

  const{rows}=await db.query(query, [booking_id]);
  return rows[0];

};

exports.countAllBookings=async()=>{
  const query=`select count(*) as total_bookings from bookings`;
  const {rows}=await db.query(query);
  return parseInt(rows[0].total_bookings,10)
};