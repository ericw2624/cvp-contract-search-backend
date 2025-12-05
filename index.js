// index.js
// Simple Express backend for CVP contract search (starter version)

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Render will set process.env.PORT automatically
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route - quick sanity check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "CVP Contract Search Backend is running.",
    docs: "/health and POST /sam-search are available."
  });
});

// Health check route (for you and Render)
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /sam-search
 * This is a placeholder endpoint for now.
 * Later we’ll plug in real SAM.gov / forecast logic.
 */
app.post("/sam-search", (req, res) => {
  console.log("Received /sam-search request:", req.body);

  const {
    naicsCodes = [],
    setAsides = [],
    dueWithinDays = 30,
    placeOfPerformance = {}
  } = req.body || {};

  const mockResults = [
    {
      id: "SAMPLE-OPP-001",
      title: "Sample Logistics Support Requirement",
      agency: "Department of Veterans Affairs",
      naics: "541614",
      setAside: "SDVOSB",
      responseDueDate: "2025-12-31",
      placeOfPerformance: {
        city: "Atlanta",
        state: "GA"
      },
      noticeType: "Sources Sought",
      url: "https://sam.gov/opp/SAMPLE-OPP-001"
    },
    {
      id: "SAMPLE-OPP-002",
      title: "Nationwide Transportation Services",
      agency: "Defense Logistics Agency",
      naics: "484121",
      setAside: "Small Business",
      responseDueDate: "2026-01-15",
      placeOfPerformance: {
        city: "Kansas City",
        state: "MO"
      },
      noticeType: "RFP",
      url: "https://sam.gov/opp/SAMPLE-OPP-002"
    }
  ];

  res.json({
    ok: true,
    source: "mock-data",
    query: {
      naicsCodes,
      setAsides,
      dueWithinDays,
      placeOfPerformance
    },
    results: mockResults
  });
});

// Catch-all 404 (for debugging)
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Route not found in backend",
    method: req.method,
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`CVP backend listening on port ${PORT}`);
});
