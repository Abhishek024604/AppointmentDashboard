from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)

# mock data
appointments = [
    {
        "id": "1",
        "patientName": "John Doe",
        "date": "2025-12-28",  
        "time": "09:00",
        "duration": 60,
        "doctorName": "Dr. Sarah Johnson",
        "type": "General Checkup",
        "status": "Scheduled"
    },
    {
        "id": "2",
        "patientName": "Emily Clark",
        "date": "2025-12-29", # Upcoming
        "time": "10:30",
        "duration": 30,
        "doctorName": "Dr. Michael Chen",
        "type": "Follow-up",
        "status": "Confirmed"
    },
    {
        "id": "3",
        "patientName": "Robert Martinez",
        "date": "2025-12-29", # Upcoming
        "time": "14:00",
        "duration": 45,
        "doctorName": "Dr. Emily White",
        "type": "Dental Cleaning",
        "status": "Scheduled"
    },
    {
        "id": "4",
        "patientName": "Susan Lee",
        "date": "2025-12-29", # Upcoming
        "time": "11:15",
        "duration": 60,
        "doctorName": "Dr. Sarah Johnson",
        "type": "Physical Therapy",
        "status": "Cancelled"
    },
    {
        "id": "5",
        "patientName": "Michael Brown",
        "date": "2025-12-30", # Upcoming
        "time": "09:45",
        "duration": 30,
        "doctorName": "Dr. Michael Chen",
        "type": "Vaccination",
        "status": "Completed"
    },
    {
        "id": "6",
        "patientName": "Jessica Taylor",
        "date": "2025-12-30", # Upcoming
        "time": "16:00",
        "duration": 90,
        "doctorName": "Dr. Emily White",
        "type": "Surgery Consult",
        "status": "Confirmed"
    },
    {
        "id": "7",
        "patientName": "David Wilson",
        "date": "2026-01-02", # Upcoming 
        "time": "13:00",
        "duration": 45,
        "doctorName": "Dr. Sarah Johnson",
        "type": "Dermatology",
        "status": "Scheduled"
    },
    {
        "id": "8",
        "patientName": "Laura Garcia",
        "date": "2026-01-03", # Upcoming
        "time": "10:00",
        "duration": 60,
        "doctorName": "Dr. Michael Chen",
        "type": "General Checkup",
        "status": "Scheduled"
    },
    {
        "id": "9",
        "patientName": "James Anderson",
        "date": "2025-12-25", # Past Date
        "time": "15:30",
        "duration": 30,
        "doctorName": "Dr. Emily White",
        "type": "Follow-up",
        "status": "Completed"
    },
    {
        "id": "10",
        "patientName": "Karen Thomas",
        "date": "2025-12-28", 
        "time": "13:00",
        "duration": 60,
        "doctorName": "Dr. Sarah Johnson",
        "type": "General Checkup",
        "status": "Scheduled"
    }
]

@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    return jsonify(appointments)

@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    data = request.json
    
    # Generate ID and default status on the server side
    new_appt = {
        "id": str(uuid.uuid4()),
        "patientName": data.get('patientName'),
        "date": data.get('date'),
        "time": data.get('time'),
        "duration": data.get('duration'),
        "doctorName": data.get('doctorName'),
        "type": data.get('type'),
        "status": "Scheduled"
    }
    
    appointments.append(new_appt)
    return jsonify(new_appt), 201

@app.route('/api/appointments/<appt_id>/status', methods=['PATCH'])
def update_status(appt_id):
    data = request.json
    new_status = data.get('status')
    
    for appt in appointments:
        if appt['id'] == appt_id:
            # AWS AURORA TRANSACTIONAL WRITE
            # In a production environment, this is where we would execute 
            # a SQL UPDATE statement within a transaction block.
            # Example: cursor.execute("UPDATE appointments SET status = %s WHERE id = %s", (new_status, appt_id))
            appt['status'] = new_status
            # APPSYNC SUBSCRIPTION TRIGGER
            # After the database commit is successful, the mutation would return 
            # the updated object. This return event is what triggers the 
            # @aws_subscribe directive in AppSync, pushing the update 
            # to all clients listening to 'onUpdateAppointment'.
            return jsonify(appt)
            
    return jsonify({"error": "Appointment not found"}), 404

# if __name__ == '__main__':
#     app.run(debug=True, port=5000)