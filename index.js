// index.js
// CVP Contract Search Backend - now with real SAM.gov integration

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Render will set process.env.PORT automatically
const PORT = process.env.PORT || 10000;

// --- SAM.gov Opportunities API config ---
const SAM_API_URL = "https://api.sam.gov/opportunities/v2/search";
const SAM_API_KEY = process.env.SAM_API_KEY;

// --- Helpers ---
function formatDateMMDDYYYY(date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

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
 * Body example:
 * {
 *   "naicsCodes": ["541614", "484121"],
 *   "setAsides": ["SB"],
 *   "dueWithinDays": 30,
 *   "placeOfPerformance": { "state": "GA", "city": "Atlanta" }
 * }
 */
app.post("/sam-search", async (req, res) => {
  console.log("Received /sam-search request:", req.body);

  const {
    naicsCodes = [],
    setAsides = [],
    dueWithinDays = 30,
    placeOfPerformance = {}
  } = req.body || {};

  // If no API key is configured, fall back to mock data so the GPT doesn’t break.
  if (!SAM_API_KEY) {
    console.warn("SAM_API_KEY is not set. Returning mock data.");
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

    return res.json({
      ok: true,
      source: "mock-data-no-api-key",
      query: {
        naicsCodes,
        setAsides,
        dueWithinDays,
        placeOfPerformance
      },
      results: mockResults
    });
  }

  try {
    // Build date range for response deadline (rdlfrom / rdlto)
    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + (Number(dueWithinDays) || 30));

    const params = new URLSearchParams();
params.set("api_key", SAM_API_KEY);
params.set("limit", "50"); // adjust as needed (max 1000)

// SAM.gov now requires PostedFrom and PostedTo (posting date range)
params.set("postedFrom", formatDateMMDDYYYY(today));
params.set("postedTo", formatDateMMDDYYYY(end));

// Also filter by response deadline, if supported
params.set("rdlfrom", formatDateMMDDYYYY(today));
params.set("rdlto", formatDateMMDDYYYY(end));

    // Filter by first NAICS code if provided
    if (Array.isArray(naicsCodes) && naicsCodes.length > 0) {
      params.set("ncode", String(naicsCodes[0]));
    }

    // Filter by first set-aside, if provided (e.g., SB, WOSB, SDVOSB)
    if (Array.isArray(setAsides) && setAsides.length > 0) {
      params.set("typeOfSetAside", String(setAsides[0]));
    }

    // Place of performance - state-level filter
    if (placeOfPerformance && placeOfPerformance.state) {
      params.set("state", String(placeOfPerformance.state));
    }

    // Optional: show mostly solicitations / combined synopsis.
    // ptype is optional; comment out if you want *all* notice types.
    // params.set("ptype", "k,o");

    const url = `${SAM_API_URL}?${params.toString()}`;
    console.log("Calling SAM.gov API:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("SAM.gov API error:", response.status, text);
      return res.status(502).json({
        ok: false,
        source: "sam.gov-api",
        message: "Error calling SAM.gov API",
        status: response.status,
        raw: text
      });
    }

    const data = await response.json();
    const opportunities = data.opportunitiesData || [];

    const results = opportunities.map((opp) => {
      // NAICS can be in different fields depending on structure
      let naicsCode = null;
      if (Array.isArray(opp.naics)) {
        naicsCode = opp.naics[0]?.naicsCode || opp.naics[0]?.code || null;
      } else {
        naicsCode = opp.naicsCode || opp.naics || null;
      }

      const place = opp.placeOfPerformance || {};
      return {
        id: opp.noticeId || opp.solicitationNumber || null,
        title: opp.title || null,
        agency: opp.fullParentPathName || opp.department || null,
        naics: naicsCode,
        setAside:
          opp.typeOfSetAsideDescription ||
          opp.typeOfSetAside ||
          opp.setAside ||
          null,
        responseDueDate: opp.responseDeadLine || opp.responseDate || null,
        placeOfPerformance: {
          city: place.city || null,
          state: place.state || null
        },
        noticeType: opp.noticeType || opp.type || null,
        url: opp.uiLink || (opp.resourceLinks && opp.resourceLinks[0]?.href) || null
      };
    });

    res.json({
      ok: true,
      source: "sam.gov-api",
      query: {
        naicsCodes,
        setAsides,
        dueWithinDays,
        placeOfPerformance
      },
      totalRecords: data.totalRecords || results.length,
      results
    });
  } catch (err) {
    console.error("Unhandled error in /sam-search:", err);
    res.status(500).json({
      ok: false,
      source: "backend",
      message: "Unexpected error in backend while calling SAM.gov",
      error: String(err?.message || err)
    });
  }
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
