# 🏛️ Dilli Darshan (दिल्ली दर्शन)
> **Smart Delhi Journey, Budget & Itinerary Planner**

**Dilli Darshan** is a full-stack web application designed to help tourists, backpackers, and locals explore India's historic capital efficiently. By taking into account user budget, duration, visitor category (Indian vs. International), and geographical zones, the platform automatically generates optimized, sequential day-wise travel itineraries complete with ticket pricing, Metro navigation, and time slots.

---

## ✨ Key Features

- 🎯 **Automated Sequential Itinerary Generator**:
  - Dynamically builds 1 to 3-day sequential schedules.
  - Budget-aware distribution: Entry tickets, Delhi Metro transit estimates, and daily meal allowances.
  - Differentiation between Indian and Foreigner monument entry fees.
  
- 🧭 **Interactive Radial Zone Selector**:
  - Visual exploration of Delhi across 6 zones: **Old Delhi, Central, South, North, East, and West Delhi**.
  - Quick filtering by region, popularity, and monument clusters.

- 🚇 **Delhi Metro Route Guidance**:
  - Shows nearest metro stations and line tips for each destination to minimize transit time.

- 🗂️ **Comprehensive Destination Catalog**:
  - 27+ curated attractions including monuments, spiritual centers, bazaars, and museums.
  - Real-time details on opening hours, weekly closed days (e.g., Monday closures), ratings, and entry fees.

- 🌐 **Bilingual & Adaptive UI**:
  - One-click language switch between **English** and **हिन्दी (Hindi)**.
  - Smooth **Dark Mode / Light Mode** theme toggle.

- 💾 **Save & Retrieve Itineraries**:
  - Unique 8-character Trip ID generation to easily bookmark, reload, or print trip itineraries.

---

## 🛠️ Tech Stack

- **Backend**: Python 3, [Flask](https://flask.palletsprojects.com/)
- **Database**: SQLite3
- **Frontend**: HTML5, Vanilla JavaScript (ES6+), CSS3 (CSS Variables, Flexbox & Grid)
- **Icons & Typography**: FontAwesome 6, Plus Jakarta Sans, Outfit

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/your-username/dilli-darshan.git
cd dilli-darshan
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Initialize the database
```bash
python seed_db.py
```

### 4. Run the web server
```bash
python app.py
```

Open your browser and navigate to **`http://127.0.0.1:5000`**.
