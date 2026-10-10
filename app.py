import sqlite3
import os
import shutil
import uuid
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Handle writable DB path in serverless environments like Vercel
BASE_DB = os.path.join(os.path.dirname(__file__), 'delhi_darshan.db')
if os.environ.get('VERCEL'):
    DB_PATH = '/tmp/delhi_darshan.db'
    if not os.path.exists(DB_PATH) and os.path.exists(BASE_DB):
        shutil.copyfile(BASE_DB, DB_PATH)
else:
    DB_PATH = BASE_DB

def get_db_connection():
    if os.environ.get('VERCEL') and not os.path.exists(DB_PATH) and os.path.exists(BASE_DB):
        shutil.copyfile(BASE_DB, DB_PATH)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/zones', methods=['GET'])
def get_zones():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    zones = cursor.execute('''
        SELECT z.*, COUNT(p.id) as place_count 
        FROM zones z 
        LEFT JOIN places p ON z.code = p.zone_code 
        GROUP BY z.code
    ''').fetchall()
    
    conn.close()
    return jsonify([dict(z) for z in zones])

@app.route('/api/places', methods=['GET'])
def get_places():
    zone = request.args.get('zone', 'all')
    category = request.args.get('category', 'all')
    search = request.args.get('search', '').strip()
    visitor_type = request.args.get('visitor_type', 'indian')
    max_budget = request.args.get('max_budget', type=float)

    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM places WHERE 1=1"
    params = []

    if zone != 'all':
        query += " AND zone_code = ?"
        params.append(zone)

    if category != 'all':
        query += " AND category = ?"
        params.append(category)

    if search:
        query += " AND (name LIKE ? OR description LIKE ? OR nearest_metro LIKE ?)"
        search_pattern = f"%{search}%"
        params.extend([search_pattern, search_pattern, search_pattern])

    if max_budget is not None:
        if visitor_type == 'foreigner':
            query += " AND fee_foreigner_adult <= ?"
        else:
            query += " AND fee_indian_adult <= ?"
        params.append(max_budget)

    query += " ORDER BY rating DESC, name ASC"
    
    places = cursor.execute(query, params).fetchall()
    conn.close()
    
    return jsonify([dict(p) for p in places])

@app.route('/api/places/<int:place_id>', methods=['GET'])
def get_place(place_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    place = cursor.execute("SELECT * FROM places WHERE id = ?", (place_id,)).fetchone()
    conn.close()
    
    if place is None:
        return jsonify({'error': 'Place not found'}), 404
        
    return jsonify(dict(place))

@app.route('/api/generate-itinerary', methods=['POST'])
def generate_itinerary():
    data = request.json or {}
    budget = float(data.get('budget', 1500))
    zone_pref = data.get('zone', 'all')
    visitor_type = data.get('visitor_type', 'indian') # 'indian' or 'foreigner'
    days = int(data.get('days', 1))
    companion = data.get('companion', 'solo') # solo, couple, family, friends

    conn = get_db_connection()
    cursor = conn.cursor()

    # Query candidate places
    if zone_pref == 'all':
        places_rows = cursor.execute("SELECT * FROM places ORDER BY rating DESC").fetchall()
    else:
        places_rows = cursor.execute("SELECT * FROM places WHERE zone_code = ? ORDER BY rating DESC", (zone_pref,)).fetchall()

    places = [dict(p) for p in places_rows]
    conn.close()

    # Smart sequential distribution
    # Budget allocation: 60% for entry fees, 20% transport, 20% food allowance
    estimated_daily_food = 200 * days
    estimated_daily_transport = 150 * days
    allocated_entry_budget = max(0, budget - estimated_daily_food - estimated_daily_transport)

    # Filter places according to visitor entry fees
    selected_places = []
    current_entry_cost = 0.0

    for place in places:
        fee = place['fee_foreigner_adult'] if visitor_type == 'foreigner' else place['fee_indian_adult']
        
        # Check budget constraint (free places always included if high rating)
        if fee == 0 or (current_entry_cost + fee <= allocated_entry_budget):
            selected_places.append(place)
            current_entry_cost += fee
            
        # Target ~4-5 spots per day
        if len(selected_places) >= days * 4:
            break

    # If selected list is too small due to strict budget, include top rated free/low cost spots
    if len(selected_places) < days * 3:
        for place in places:
            if place not in selected_places:
                fee = place['fee_foreigner_adult'] if visitor_type == 'foreigner' else place['fee_indian_adult']
                if fee == 0 or current_entry_cost + fee <= budget:
                    selected_places.append(place)
                    current_entry_cost += fee
                if len(selected_places) >= days * 4:
                    break

    # Build Day-wise sequential schedule
    # Time slots: 09:00 AM, 11:30 AM, 02:30 PM, 05:00 PM, 07:30 PM
    time_slots = ["09:00 AM", "11:30 AM", "02:30 PM", "05:00 PM", "07:30 PM"]
    
    itinerary_id = str(uuid.uuid4())[:8]
    day_plans = []
    total_entry_fees = 0.0
    total_transport = 0.0

    places_per_day = (len(selected_places) + days - 1) // days if days > 0 else len(selected_places)
    
    idx = 0
    for day in range(1, days + 1):
        day_items = []
        slot_idx = 0
        
        for d_item in range(min(places_per_day, len(selected_places) - idx)):
            if idx >= len(selected_places):
                break
            place = selected_places[idx]
            idx += 1

            fee = place['fee_foreigner_adult'] if visitor_type == 'foreigner' else place['fee_indian_adult']
            total_entry_fees += fee
            transport_cost = 35.0  # Avg Metro fare
            total_transport += transport_cost

            start_t = time_slots[slot_idx % len(time_slots)]
            
            # Simple duration addition
            dur_mins = place['recommended_duration_mins']
            
            day_items.append({
                'sequence': d_item + 1,
                'place': place,
                'start_time': start_t,
                'duration_mins': dur_mins,
                'entry_fee': fee,
                'transport_cost': transport_cost,
                'metro_tip': place['nearest_metro'],
                'closed_warning': place['closed_on'] if place['closed_on'] != 'None' else None
            })
            slot_idx += 1

        day_plans.append({
            'day': day,
            'items': day_items
        })

    grand_total = total_entry_fees + total_transport + (150 * days)

    itinerary_res = {
        'id': itinerary_id,
        'title': f"{days}-Day Delhi {zone_pref.upper() if zone_pref != 'all' else 'Explorer'} Tour",
        'budget': budget,
        'visitor_type': visitor_type,
        'zone_preference': zone_pref,
        'days': days,
        'breakdown': {
            'entry_fees': total_entry_fees,
            'estimated_transport': total_transport,
            'estimated_food': 150 * days,
            'total_cost': grand_total,
            'remaining_budget': budget - grand_total
        },
        'day_plans': day_plans
    }

    # Save to SQLite DB
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO itineraries (id, title, user_budget, visitor_type, zone_preference, days, total_cost)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (itinerary_id, itinerary_res['title'], budget, visitor_type, zone_pref, days, grand_total))

    for day_plan in day_plans:
        for item in day_plan['items']:
            cursor.execute('''
                INSERT INTO itinerary_items (itinerary_id, place_id, day_number, sequence_order, start_time, estimated_transport_cost)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (itinerary_id, item['place']['id'], day_plan['day'], item['sequence'], item['start_time'], item['transport_cost']))

    conn.commit()
    conn.close()

    return jsonify(itinerary_res)

@app.route('/api/itineraries/<itinerary_id>', methods=['GET'])
def get_itinerary(itinerary_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    itinerary = cursor.execute("SELECT * FROM itineraries WHERE id = ?", (itinerary_id,)).fetchone()
    if not itinerary:
        conn.close()
        return jsonify({'error': 'Itinerary not found'}), 404

    items = cursor.execute('''
        SELECT ii.*, p.name, p.zone_code, p.category, p.description, p.fee_indian_adult, p.fee_foreigner_adult,
               p.timing_open, p.timing_close, p.closed_on, p.recommended_duration_mins, p.nearest_metro, p.image_url, p.rating
        FROM itinerary_items ii
        JOIN places p ON ii.place_id = p.id
        WHERE ii.itinerary_id = ?
        ORDER BY ii.day_number ASC, ii.sequence_order ASC
    ''', (itinerary_id,)).fetchall()
    
    conn.close()

    # Format result
    day_plans_dict = {}
    total_entry_fees = 0
    total_transport = 0

    visitor_type = itinerary['visitor_type']

    for row in items:
        r = dict(row)
        day_num = r['day_number']
        if day_num not in day_plans_dict:
            day_plans_dict[day_num] = []

        fee = r['fee_foreigner_adult'] if visitor_type == 'foreigner' else r['fee_indian_adult']
        total_entry_fees += fee
        total_transport += r['estimated_transport_cost']

        day_plans_dict[day_num].append({
            'sequence': r['sequence_order'],
            'place': {
                'id': r['place_id'],
                'name': r['name'],
                'zone_code': r['zone_code'],
                'category': r['category'],
                'description': r['description'],
                'fee_indian_adult': r['fee_indian_adult'],
                'fee_foreigner_adult': r['fee_foreigner_adult'],
                'timing_open': r['timing_open'],
                'timing_close': r['timing_close'],
                'closed_on': r['closed_on'],
                'recommended_duration_mins': r['recommended_duration_mins'],
                'nearest_metro': r['nearest_metro'],
                'image_url': r['image_url'],
                'rating': r['rating']
            },
            'start_time': r['start_time'],
            'duration_mins': r['recommended_duration_mins'],
            'entry_fee': fee,
            'transport_cost': r['estimated_transport_cost'],
            'metro_tip': r['nearest_metro'],
            'closed_warning': r['closed_on'] if r['closed_on'] != 'None' else None
        })

    day_plans = [{'day': day_num, 'items': items_list} for day_num, items_list in day_plans_dict.items()]
    days_cnt = itinerary['days']

    return jsonify({
        'id': itinerary['id'],
        'title': itinerary['title'],
        'budget': itinerary['user_budget'],
        'visitor_type': visitor_type,
        'zone_preference': itinerary['zone_preference'],
        'days': days_cnt,
        'breakdown': {
            'entry_fees': total_entry_fees,
            'estimated_transport': total_transport,
            'estimated_food': 150 * days_cnt,
            'total_cost': itinerary['total_cost'],
            'remaining_budget': itinerary['user_budget'] - itinerary['total_cost']
        },
        'day_plans': day_plans
    })

if __name__ == '__main__':
    print("Starting Delhi Darshan Web Server on http://127.0.0.1:5000 ...")
    app.run(debug=True, port=5000)
