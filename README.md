# cvp-contract-search-backend

# CVP SAM.gov Automated Search Service

The CVP SAM.gov Automated Search Service is a backend application that retrieves federal contract opportunities from SAM.gov based on CVP Business Ventures LLC's NAICS codes and search criteria. It is designed to support automated daily searches, state-level searches, national searches, and filtered searches by set-aside type. 

This service powers the internal "CVP SAM Search GPT" and can also be used by other CVP tools and dashboards.

---

## 🚀 Features

- Automated search across SAM.gov public API
- Filters by:
  - NAICS codes
  - Response due date
  - State or national region
  - Set-aside type (Small Business, SDVOSB, WOSB, HUBZone, etc.)
  - Fully open competition
- Categorizes results into:
  - **RFPs / RFQs**
  - **Sources Sought / RFIs / Presolicitations**
- Returns:
  - Opportunity title
  - SAM.gov link
  - Response due date
  - Agency
  - Summary details
- REST API for integration with GPTs, front-end apps, or automated workflows

---

## 🛠️ Technologies Used

- Node.js  
- Express.js  
- axios (HTTP requests)  
- SAM.gov Public API  
- Render.com (deployment)  
- GitHub (source control)

---

## 📦 Installation

Clone the repository: https://github.com/ericw2624/cvp-contract-search-backend

Install dependencies: npm install

Start the server: npm start

---

## 🔑 Environment Variables

Create a `.env` file in the root of your project with: PORT=3000
SAM_API_KEY=your_sam_gov_api_key_here
DEFAULT_NAICS=541614,484121,484210,541611,423450

**Do NOT commit your `.env` file to GitHub.**

---

## 📡 API Endpoints

### `GET /search`

Query parameters:

| Parameter        | Required | Description |
|-----------------|----------|-------------|
| `naics`         | No       | Comma-separated NAICS list (defaults to CVP’s list) |
| `state`         | No       | Search by 2-letter state code |
| `setAside`      | No       | Filter by set-aside type |
| `daysOut`       | No       | Opportunities due within X days |
| `type`          | No       | rfp, rfq, sources-sought, presolicitation, etc. |

Example: /search?state=GA&daysOut=30&type=rfp

---

## 📊 Output Format

Each opportunity includes: 
{
"title": "...",
"solicitationNumber": "...",
"responseDate": "2025-01-12",
"agency": "Department of Homeland Security",
"link": "https://sam.gov/opp/123456/view
",
"type": "RFP",
"description": "..."
}

---

## 🧠 How It Works

1. The backend sends a request to the **SAM.gov public API**.  
2. Results are filtered by:
   - NAICS codes  
   - Set-aside status  
   - Response due date  
   - Opportunity type  
   - Geographic region (if requested)  
3. The API returns clean, structured JSON.  
4. The GPT or front-end app formats and presents the information.

---

## 📘 Compliance Statement

This application accesses **only publicly available** SAM.gov contract opportunity data using the official public API endpoints at `api.sam.gov`.

This system **does not**:
- Automate login to SAM.gov  
- Bypass authentication  
- Access restricted federal systems  
- Store or redistribute protected or sensitive data  

All automated searches comply with:
- SAM.gov Terms of Service  
- API rate limits  
- robots.txt guidance  
- Federal information access policies  

Data is used **solely** for internal business intelligence and federal opportunity identification by **CVP Business Ventures LLC**.

---

## 📅 Future Enhancements

- Daily automated Excel exports  
- Email/SMS alerts  
- Dashboard UI for CVP leadership  
- Opportunity scoring & prioritization  
- Multi-agency pattern tracking  
- Integration with CVP Procurement Forecast Hunter

---

## 📩 Contact

CVP Business Ventures LLC  
Internal Tooling & Automation Division  
For questions or enhancements, contact the system owner.

## Compliance Statement

This application accesses only publicly available SAM.gov contract opportunity data using the official public API endpoints at api.sam.gov. 
It does not automate login, bypass authentication, or access restricted government systems.

All automated searches comply with SAM.gov Terms of Service, rate limitations, and robots.txt guidance. 
Data is used solely for internal business intelligence and federal opportunity identification by CVP Business Ventures LLC.
