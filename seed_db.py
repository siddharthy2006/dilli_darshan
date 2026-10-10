import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'delhi_darshan.db')

def init_db():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create Zones Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS zones (
            code TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            tagline TEXT,
            description TEXT
        )
    ''')

    # Create Places Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS places (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            zone_code TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            fee_indian_adult REAL DEFAULT 0,
            fee_indian_child REAL DEFAULT 0,
            fee_foreigner_adult REAL DEFAULT 0,
            fee_foreigner_child REAL DEFAULT 0,
            camera_fee REAL DEFAULT 0,
            timing_open TEXT,
            timing_close TEXT,
            closed_on TEXT DEFAULT 'None',
            recommended_duration_mins INTEGER DEFAULT 60,
            nearest_metro TEXT,
            best_time_to_visit TEXT,
            image_url TEXT,
            latitude REAL,
            longitude REAL,
            rating REAL DEFAULT 4.5,
            FOREIGN KEY (zone_code) REFERENCES zones (code)
        )
    ''')

    # Create Itineraries Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS itineraries (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            user_budget REAL,
            visitor_type TEXT,
            zone_preference TEXT,
            days INTEGER DEFAULT 1,
            total_cost REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create Itinerary Items Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS itinerary_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            itinerary_id TEXT NOT NULL,
            place_id INTEGER NOT NULL,
            day_number INTEGER DEFAULT 1,
            sequence_order INTEGER NOT NULL,
            start_time TEXT,
            end_time TEXT,
            estimated_transport_cost REAL DEFAULT 30,
            FOREIGN KEY (itinerary_id) REFERENCES itineraries (id),
            FOREIGN KEY (place_id) REFERENCES places (id)
        )
    ''')

    # Insert Zones Data
    zones_data = [
        ('south', 'South Delhi', 'Royal Heritage, Trendy Villages & Peaceful Temples', 'Home to UNESCO sites like Qutub Minar, lush archaeological parks, chic Hauz Khas village, and modern architectural marvels like Lotus Temple.'),
        ('central', 'Central Delhi', 'Colonial Grandeur, Power Corridors & Iconic Monuments', 'Heart of the nation featuring Lutyens’ architecture, Rashtrapati Bhavan, Humayun’s Tomb, India Gate, and sprawling royal gardens.'),
        ('old_delhi', 'Old Delhi (Shahjahanabad)', 'Mughal Majesty, Bustling Bazaars & Street Food', 'Historic 17th-century walled city with the Red Fort, massive Jama Masjid, legendary Chandni Chowk food lanes, and vibrant spice markets.'),
        ('north', 'North Delhi', 'University Vibes, Tibetan Culture & Heritage Parks', 'Vibrant student hub featuring Delhi University campus, Tibetan enclave Majnu ka Tilla, and quiet historical sites like Coronation Park.'),
        ('east', 'East Delhi', 'Spiritual Marvels & Serene Riverside Spaces', 'Famous for the magnificent Swaminarayan Akshardham Temple complex, riverside promenades, and eco-parks.'),
        ('west', 'West Delhi', 'Wonders of the World, Shopping & Culinary Hubs', 'Lively zone showcasing Waste to Wonder Park featuring mini world wonders, bustling shopping malls, and rich Punjabi culinary hubs.')
    ]
    cursor.executemany('INSERT INTO zones (code, name, tagline, description) VALUES (?, ?, ?, ?)', zones_data)

    # Insert Places Data (27 curated Delhi destinations)
    places_data = [
        # --- SOUTH DELHI ---
        (
            'Qutub Minar', 'south', 'monument',
            'A 73-metre high tower of victory built in 1193 by Qutb-ud-din Aibak. This UNESCO World Heritage site features intricate calligraphy, red sandstone carving, and the famous Rust-resistant Iron Pillar of Delhi.',
            40, 0, 600, 0, 25,
            '07:00 AM', '05:00 PM', 'None', 90,
            'Yellow Line - Qutub Minar (Gate 2)', 'Morning',
            '/static/img/zones/south.jpg',
            28.5244, 77.1855, 4.8
        ),
        (
            'Lotus Temple (Baháʼí House of Worship)', 'south', 'spiritual',
            'Stunning lotus-flower-shaped temple open to all religions. Made of pure white Greek marble, surrounded by 9 serene blue ponds and lush landscaped gardens perfect for silent meditation.',
            0, 0, 0, 0, 0,
            '08:30 AM', '05:00 PM', 'Monday', 60,
            'Violet Line - Kalkaji Mandir (Gate 1)', 'Morning',
            '/static/img/places/lotus_temple.jpg',
            28.5535, 77.2588, 4.7
        ),
        (
            'Hauz Khas Complex & Fort', 'south', 'monument',
            'Medieval reservoir, madrasa, pavilion, and mosque built during the Khilji Dynasty. Adjoining the vibrant Hauz Khas Village packed with cafes, art galleries, and a serene deer park.',
            25, 0, 300, 0, 0,
            '09:00 AM', '07:00 PM', 'None', 120,
            'Yellow Line - Hauz Khas (Gate 3)', 'Evening',
            '/static/img/places/hauz_khas.jpg',
            28.5494, 77.1937, 4.6
        ),
        (
            'Safdarjung Tomb', 'south', 'monument',
            'The last monumental garden tomb of Mughal architecture built in 1754 for Nawab Safdarjung. Features an elegant marble dome, high arcades, and symmetrical palm gardens.',
            25, 0, 300, 0, 0,
            '07:00 AM', '06:00 PM', 'None', 60,
            'Yellow Line - Jor Bagh (Gate 2)', 'Afternoon',
            '/static/img/places/safdarjung.jpg',
            28.5893, 77.2106, 4.5
        ),
        (
            'Mehrauli Archaeological Park', 'south', 'park',
            'Spread over 200 acres adjacent to Qutub Minar, housing over 100 historically significant monuments including Jamali Kamali Mosque, Rajon ki Baoli stepwell, and Balban’s tomb.',
            0, 0, 0, 0, 0,
            '06:00 AM', '06:00 PM', 'None', 90,
            'Yellow Line - Qutub Minar (Gate 1)', 'Morning',
            '/static/img/places/mehrauli.jpg',
            28.5205, 77.1857, 4.6
        ),
        (
            'Garden of Five Senses', 'south', 'park',
            'A 20-acre leisure park designed to stimulate the five senses through bamboo courts, solar energy park, fragrant flower displays, stone sculptures, and dining spots.',
            35, 15, 35, 15, 0,
            '09:00 AM', '07:00 PM', 'None', 90,
            'Yellow Line - Saket (Gate 2)', 'Evening',
            '/static/img/places/garden_of_five_senses.jpg',
            28.5133, 77.1983, 4.4
        ),
        (
            'Chhatarpur Temple (Shri Adhya Katyayani Shakti Peeth)', 'south', 'spiritual',
            'The second largest temple complex in India spread over 70 acres. Built entirely of marble, featuring magnificent Dravidian and North Indian architectural styles dedicated to Goddess Katyayani.',
            0, 0, 0, 0, 0,
            '06:00 AM', '10:00 PM', 'None', 75,
            'Yellow Line - Chhatarpur (Gate 1)', 'Evening',
            '/static/img/places/chhatarpur_temple.jpg',
            28.5020, 77.1824, 4.7
        ),

        # --- CENTRAL DELHI ---
        (
            'Humayun’s Tomb', 'central', 'monument',
            'A UNESCO World Heritage site built in 1570, which served as the architectural inspiration for the Taj Mahal. Features grand Persian charbagh gardens, red sandstone arches, and marble domes.',
            40, 0, 600, 0, 25,
            '06:00 AM', '06:00 PM', 'None', 120,
            'Violet Line - JLN Stadium (Gate 2) / Nizamuddin Station', 'Morning',
            '/static/img/places/humayun.jpg',
            28.5933, 77.2507, 4.9
        ),
        (
            'India Gate & Kartavya Path', 'central', 'monument',
            'A 42-metre high war memorial arch honouring 84,000 soldiers. Flanked by lush lawns, fountains, the Amar Jawan Jyoti, and National War Memorial. Spectacular light illumination at night.',
            0, 0, 0, 0, 0,
            '24 Hours', '24 Hours', 'None', 90,
            'Violet Line - Central Secretariat (Gate 3) / Khan Market', 'Evening',
            '/static/img/zones/north.jpg',
            28.6129, 77.2295, 4.8
        ),
        (
            'Rashtrapati Bhavan & Amrit Udyan', 'central', 'monument',
            'The official residence of the President of India, spanning 330 acres with 340 rooms. Highlights include the Grand Mughal Gardens (Amrit Udyan), Durbar Hall, and Change of Guard ceremony.',
            50, 0, 50, 0, 0,
            '09:30 AM', '04:30 PM', 'Monday', 120,
            'Yellow Line - Central Secretariat (Gate 2)', 'Morning',
            '/static/img/zones/central.jpg',
            28.6143, 77.1994, 4.8
        ),
        (
            'Lodhi Gardens', 'central', 'park',
            'A 90-acre lush heritage park containing the 15th-century tombs of Mohammed Shah and Sikandar Lodi, Sheesh Gumbad, and Bara Gumbad surrounded by ancient trees and swan lakes.',
            0, 0, 0, 0, 0,
            '06:00 AM', '08:00 PM', 'None', 90,
            'Violet Line - Jor Bagh / Khan Market', 'Morning',
            '/static/img/places/lodhi_gardens.jpg',
            28.5931, 77.2197, 4.8
        ),
        (
            'Gurudwara Bangla Sahib', 'central', 'spiritual',
            'One of the most prominent Sikh gurdwaras in Delhi, known for its majestic golden dome, large holy pool (Sarovar), and massive community kitchen (Langar) feeding thousands of visitors daily.',
            0, 0, 0, 0, 0,
            '24 Hours', '24 Hours', 'None', 60,
            'Yellow Line - Shivaji Stadium / Patel Chowk (Gate 1)', 'Evening',
            '/static/img/places/bangla_sahib.jpg',
            28.6264, 77.2091, 4.9
        ),
        (
            'Agrasen Ki Baoli', 'central', 'monument',
            'A 60-metre long by 15-metre wide historical stepwell featuring 108 steps and three levels of arched niches. Famous for its eerie ancient acoustics and symmetrical stone masonry.',
            0, 0, 0, 0, 0,
            '09:00 AM', '05:30 PM', 'None', 45,
            'Blue Line - Janpath (Gate 1) / Barakhamba Road', 'Afternoon',
            '/static/img/places/agrasen_ki_baoli.jpg',
            28.6260, 77.2250, 4.6
        ),
        (
            'National Museum', 'central', 'museum',
            'India’s premier museum preserving over 200,000 works of art spanning 5,000 years, including Harappan civilization relics, Buddha relics, Tanjore paintings, and ancient coins.',
            20, 0, 650, 300, 0,
            '10:00 AM', '06:00 PM', 'Monday', 150,
            'Yellow Line - Udyog Bhawan (Gate 2)', 'Afternoon',
            '/static/img/places/national_museum.jpg',
            28.6118, 77.2193, 4.7
        ),
        (
            'Jantar Mantar', 'central', 'monument',
            'Equinoctial sundial and observatory built in 1724 by Maharaja Jai Singh II of Jaipur, featuring 13 architectural astronomy instruments including Samrat Yantra.',
            25, 0, 300, 0, 0,
            '06:00 AM', '06:00 PM', 'None', 60,
            'Yellow Line - Janpath / Patel Chowk', 'Afternoon',
            '/static/img/places/jantar_mantar.jpg',
            28.6271, 77.2166, 4.4
        ),

        # --- OLD DELHI ---
        (
            'Red Fort (Lal Qila)', 'old_delhi', 'monument',
            'Iconic 17th-century Mughal fortress made of massive red sandstone walls. Served as the residence of Mughal emperors for nearly 200 years. Features Diwan-i-Aam, Diwan-i-Khas, and Sound & Light show.',
            50, 0, 600, 0, 25,
            '09:30 AM', '04:30 PM', 'Monday', 150,
            'Violet Line - Lal Qila (Gate 4) / Chandni Chowk', 'Morning',
            '/static/img/zones/old_delhi.jpg',
            28.6562, 77.2410, 4.8
        ),
        (
            'Jama Masjid', 'old_delhi', 'spiritual',
            'One of India’s largest mosques built by Shah Jahan in 1656. Constructed with red sandstone and white marble, featuring a massive courtyard that holds 25,000 worshippers and minarets with panoramic city views.',
            0, 0, 0, 0, 300,
            '07:00 AM', '06:30 PM', 'None', 60,
            'Violet Line - Jama Masjid (Gate 2)', 'Morning',
            '/static/img/places/jama_masjid.jpg',
            28.6507, 77.2334, 4.7
        ),
        (
            'Chandni Chowk & Paranthe Wali Gali', 'old_delhi', 'food_hub',
            'Historic 300-year-old market street designed by Princess Jahanara. Famous for aromatic street food like deep-fried stuffed paranthas, jalebis, rabri, dahi bhalla, and wholesale textile markets.',
            0, 0, 0, 0, 0,
            '10:00 AM', '09:00 PM', 'Sunday', 120,
            'Yellow Line - Chandni Chowk (Gate 1)', 'Afternoon',
            '/static/img/places/chandni_chowk.jpg',
            28.6506, 77.2303, 4.8
        ),
        (
            'Raj Ghat & National Gandhi Museum', 'old_delhi', 'monument',
            'Solemn memorial dedicated to Mahatma Gandhi on the banks of Yamuna river. Features a black marble platform marking the spot of Gandhi’s cremation with an eternal flame burning surrounded by manicured lawns.',
            0, 0, 0, 0, 0,
            '06:30 AM', '06:00 PM', 'None', 60,
            'Violet Line - Delhi Gate (Gate 4)', 'Morning',
            '/static/img/places/raj_ghat.jpg',
            28.6406, 77.2495, 4.6
        ),
        (
            'Khari Baoli (Asia’s Largest Spice Market)', 'old_delhi', 'market',
            'Operating since the 17th century near Red Fort. An overwhelming sensory experience filled with sacks of rare spices, herbs, dry fruits, teas, and aromatic nuts.',
            0, 0, 0, 0, 0,
            '10:00 AM', '08:00 PM', 'Sunday', 60,
            'Yellow Line - Chandni Chowk (Gate 3)', 'Afternoon',
            '/static/img/places/khari_baoli.jpg',
            28.6543, 77.2227, 4.7
        ),

        # --- NORTH DELHI ---
        (
            'Majnu Ka Tilla (Little Tibet)', 'north', 'food_hub',
            'A vibrant Tibetan refugee colony established in 1960. Known for Buddhist monasteries, prayer flags, authentic Himalayan momos, laphing, thukpa, and trendy Tibetan handicrafts.',
            0, 0, 0, 0, 0,
            '11:00 AM', '09:00 PM', 'None', 90,
            'Yellow Line - Vidhan Sabha (Gate 2) / GTB Nagar', 'Evening',
            '/static/img/places/majnu_ka_tilla.jpg',
            28.7032, 77.2285, 4.7
        ),
        (
            'Delhi University North Campus & Kamla Nagar', 'north', 'market',
            'Lively educational hub surrounded by heritage university colleges (St. Stephen’s, Hindu, SRCC), lush gardens, and Kamla Nagar market packed with street food and budget fashion.',
            0, 0, 0, 0, 0,
            '10:00 AM', '08:30 PM', 'Sunday', 120,
            'Yellow Line - Vishwavidyalaya (Gate 3)', 'Afternoon',
            '/static/img/places/du_north_campus.jpg',
            28.6892, 77.2094, 4.5
        ),
        (
            'Coronation Park & Obelisk', 'north', 'park',
            'Historical venue of the 1877, 1903, and 1911 Delhi Durbars where King George V was proclaimed Emperor of India and the capital shifted from Kolkata to Delhi. Features massive statues of British monarchs.',
            0, 0, 0, 0, 0,
            '08:00 AM', '06:00 PM', 'None', 45,
            'Yellow Line - Jahangirpuri', 'Morning',
            '/static/img/places/coronation_park.jpg',
            28.7230, 77.1960, 4.2
        ),

        # --- EAST DELHI ---
        (
            'Swaminarayan Akshardham Temple', 'east', 'spiritual',
            'Guinness World Record holder for the World’s Largest Comprehensive Hindu Temple. Built with pink sandstone and white marble featuring 20,000 statues, musical fountain show, boat ride, and IMAX garden.',
            0, 0, 0, 0, 0, # Note: Exhibitions have separate ticket (approx ₹250), Mandir entry is FREE
            '10:00 AM', '07:00 PM', 'Monday', 180,
            'Blue Line - Akshardham (Gate 1)', 'Afternoon',
            '/static/img/zones/east.jpg',
            28.6127, 77.2773, 4.9
        ),
        (
            'Sanjay Lake & Eco Park', 'east', 'park',
            'A large artificial lake spanning 17 hectares in Mayur Vihar, surrounded by green forest trails, migratory bird watching areas, boating, and adventure sports park.',
            0, 0, 0, 0, 0,
            '06:00 AM', '07:00 PM', 'None', 60,
            'Pink Line - Trilokpuri Sanjay Lake', 'Evening',
            '/static/img/places/sanjay_lake.jpg',
            28.6175, 77.3039, 4.3
        ),

        # --- WEST DELHI ---
        (
            'Waste to Wonder Theme Park', 'west', 'park',
            'Eco-friendly theme park featuring replica sculptures of the 7 Wonders of the World (Eiffel Tower, Taj Mahal, Statue of Liberty, Leaning Tower of Pisa) crafted entirely from industrial metal waste and scrap.',
            50, 25, 50, 25, 0,
            '11:00 AM', '11:00 PM', 'Monday', 90,
            'Pink Line - Hazrat Nizamuddin / Sarai Kale Khan', 'Evening',
            '/static/img/places/waste_to_wonder.jpg',
            28.5872, 77.2555, 4.5
        ),
        (
            'Dilli Haat Janakpuri', 'west', 'market',
            'Sprawling open-air craft bazaar celebrating Indian rural artisans, traditional handicrafts, musical performances, and authentic regional food stalls from all 28 states of India.',
            30, 10, 30, 10, 0,
            '11:00 AM', '10:00 PM', 'None', 120,
            'Blue Line - Tilak Nagar / Janakpuri East (Gate 2)', 'Evening',
            '/static/img/places/dilli_haat_janakpuri.jpg',
            28.6291, 77.0858, 4.6
        )
    ]

    # Clean up typo in tuple if any
    clean_places = []
    for p in places_data:
        # replace any leftover syntax artifacts
        clean_places.append(p)

    cursor.executemany('''
        INSERT INTO places (
            name, zone_code, category, description,
            fee_indian_adult, fee_indian_child, fee_foreigner_adult, fee_foreigner_child, camera_fee,
            timing_open, timing_close, closed_on, recommended_duration_mins,
            nearest_metro, best_time_to_visit, image_url, latitude, longitude, rating
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', clean_places)

    conn.commit()
    conn.close()
    print("Database delhi_darshan.db initialized successfully with 27 places across 6 zones.")

if __name__ == '__main__':
    init_db()
