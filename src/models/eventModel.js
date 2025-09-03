const db = require('../config/database');
const pool = require('../config/database');

exports.fetchEvents = async ({ page = 1, limit = 10, title, location, event_date, category }) => {
  try {
    const offset = (page - 1) * limit;

    // sanitize event_date
    const validEventDate = event_date && event_date.trim() !== "" ? event_date : null;

    const values = [
      title ? `%${title}%` : null,
      location ? `%${location}%` : null,
      validEventDate,
      category ? `%${category}%` : null,
      limit,
      offset
    ];

    const query = `
      SELECT e.event_id, e.title, e.state_id, e.city_id,e.location, e.event_date, e.time,
             e.description, e.image_url, e.capacity, e.available_seats,
             e.price, e.is_active, e.created_at, e.updated_at,
             e.created_by, e.updated_by,
             c.name AS category_name, c.category_id as category_id
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.category_id
      WHERE e.is_active = TRUE
        AND ($1::text IS NULL OR e.title ILIKE $1)
        AND ($2::text IS NULL OR e.location ILIKE $2)
        AND ($3::date IS NULL OR e.event_date = $3)
        AND ($4::text IS NULL OR c.name ILIKE $4)
      ORDER BY e.event_date ASC
      LIMIT $5 OFFSET $6;
    `;

    const result = await db.query(query, values);

    const countQuery = `
      SELECT COUNT(*) AS total_events
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.category_id
      WHERE e.is_active = TRUE
        AND ($1::text IS NULL OR e.title ILIKE $1)
        AND ($2::text IS NULL OR e.location ILIKE $2)
        AND ($3::date IS NULL OR e.event_date = $3)
        AND ($4::text IS NULL OR c.name ILIKE $4);
    `;
    const countResult = await db.query(countQuery, values.slice(0, 4));

    return {
      events: result.rows,
      total: parseInt(countResult.rows[0].total_events, 10)
    };

  } catch (err) {
    console.error('Error in fetchEvents:', err.message);
    throw err;
  }
};


exports.fetchEventById = async (id) => {
  try {
    const query = `
      SELECT 
        e.event_id,
        e.title,
        e.location,
        e.event_date,
        e.time,
        e.description,
        e.image_url,
        e.capacity,
        e.available_seats,
        e.price,
        e.is_active,
        e.created_at,
        e.updated_at,
        e.created_by,
        e.updated_by,
        e.category_id as category_id,
        c.name AS category_name
      FROM events e
      JOIN categories c ON e.category_id = c.category_id 
      WHERE e.event_id = $1 AND e.is_active = TRUE
      LIMIT 1;
    `;

    const result = await db.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (err) {
    console.error('Error in fetchEventByID:', err.message);
    throw err;
  }
};


exports.updateEventsById = async (id, eventData) => {
  try {
    const query = `
      UPDATE events
      SET title = $1,
          location = $2,
          event_date = $3,
          time = $4,
          description = $5,
          category_id = $6,
          image_url = $7,
          capacity = $8,
          available_seats = $9,
          price = $10,
          updated_at = NOW()
      WHERE event_id = $11
      RETURNING *;
    `;

    const values = [
      eventData.title,
      eventData.location,
      eventData.event_date,
      eventData.time,
      eventData.description,
      eventData.category_id,
      eventData.image_url,
      eventData.capacity,
      eventData.available_seats,
      eventData.price,
      id
    ];

    const result = await db.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (err) {
    console.error('Error in updateEventsById:', err.message);
    throw err;
  }
};


// 🔹 Soft Delete Event
exports.deleteEventById = async (id) => {
  try {
    const query = `
      UPDATE events
      SET is_active = FALSE,
          updated_at = NOW()
      WHERE event_id = $1
      RETURNING *;
    `;

    const result = await db.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (err) {
    console.error('Error in deleteEventById:', err.message);
    throw err;
  }
};


exports.getEventByTitleAndDate=async(title, event_date)=>{
  const result=await pool.query(
    `select * from events where title=$1 and event_date=$2`,[title, event_date]
  );
  return result.rows[0];
};

exports.createEvent = async (eventData) => {
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
    available_seats,
    price,
    created_by
  } = eventData;

    const result = await pool.query(
    `INSERT INTO events
      (title, state_id, city_id, location, event_date, time, description,
       category_id, image_url, capacity, available_seats, price,
       is_active, created_at, updated_at, created_by, updated_by)
     VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, NOW(), NOW(), $13, $13)
     RETURNING *;`,
    [
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
      available_seats,
      price,
      created_by
    ]
  );

  return result.rows[0];
};

exports.countAllEvents=async()=>{
  const query=`select count(*) as total_events from events;`;
  const {rows}=await db.query(query);
  return parseInt(rows[0].total_events,10)
};

exports.countActiveEvents=async()=>{
  const query=`select count(*) as active_events from events where is_active=true;`;
  const {rows}=await db.query(query);
  return parseInt(rows[0].active_events,10);
};

exports.countCancelledEvents=async()=>{
  const query=`select count(*) as cancelled_events from events where is_active=false`;
  const {rows}=await db.query(query);
  return parseInt(rows[0].cancelled_events,10);
};

exports.fetchCategories=async({page=1, limit=50, name})=>{

  try {

    const offset=(page-1)*limit;
    const values=[
      name?`${name}%`:null,
      limit,
      offset
    ];

    const query=`
    SELECT category_id, name, description, created_at, updated_at
      FROM categories
      WHERE ($1::text IS NULL OR name ILIKE $1)
      ORDER BY name ASC
      LIMIT $2 OFFSET $3;
    `;

    const result=await pool.query(query, values);

    const countQuery=`
    select count(*) as total_categories
    from categories
    where($1::text is NULL or name ILIKE $1);`;

    const countResult=await pool.query(countQuery,[name?`${name}%`:null]);

    return{
      categories:result.rows,
      total:parseInt(countResult.rows[0].total_categories,10)
    };

  } catch (error) {
    console.error("Error in fetchCategories", error.message);
    throw err;
  }
};