const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./swagger");

// Routes
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

app.use(express.json());
app.use(cors({origin:"*"}));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/bookngo/events", eventRoutes);
app.use("/bookngo/auth", authRoutes);
app.use("/bookngo/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "BookNGo API is running 🚀",
    docs: "/api-docs",
  });
});

module.exports = app;
