import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "/api";

/**
 * ==============================================================================
 * ICONS
 * ==============================================================================
 */
const UserIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const ClockIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const FileIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const DotsIcon = () => <svg className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>;
const ChevronLeft = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>;
const ChevronRight = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>;
const CalendarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

const getLocalTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

/**
 * ==============================================================================
 * SUB-COMPONENT: TIME SELECTOR (12H)
 * ==============================================================================
 */
const TimeSelector = ({ value, onChange, label }) => {
    const hours = Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0'));
    const mins = ["00", "15", "30", "45"];
    
    return (
        <div className="flex-1">
            <label className="text-xs text-gray-400 font-semibold block mb-1">{label}</label>
            <div className="flex bg-gray-50 border rounded-md overflow-hidden">
                <select 
                    value={value.h} onChange={e => onChange({...value, h: e.target.value})}
                    className="bg-transparent p-2 text-sm outline-none cursor-pointer"
                >
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="p-2 text-gray-400">:</span>
                <select 
                    value={value.m} onChange={e => onChange({...value, m: e.target.value})}
                    className="bg-transparent p-2 text-sm outline-none cursor-pointer"
                >
                    {mins.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select 
                    value={value.p} onChange={e => onChange({...value, p: e.target.value})}
                    className="bg-gray-100 p-2 text-sm font-medium outline-none cursor-pointer border-l"
                >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </select>
            </div>
        </div>
    );
};

/**
 * ==============================================================================
 * COMPONENT: CREATE APPOINTMENT MODAL
 * ==============================================================================
 */
const CreateAppointmentModal = ({ onClose, onSave }) => {
  const today = getLocalTodayStr();
  const [startTime, setStartTime] = useState({ h: "09", m: "00", p: "AM" });
  const [endTime, setEndTime] = useState({ h: "10", m: "00", p: "AM" });

  const [formData, setFormData] = useState({
    patientName: "",
    date: today,
    doctorName: "Dr. Sarah Johnson",
    type: "General Checkup",
    mode: "In-person"
  });

  const get24HDate = (dateStr, timeObj) => {
    let hours = parseInt(timeObj.h);
    if (timeObj.p === "PM" && hours !== 12) hours += 12;
    if (timeObj.p === "AM" && hours === 12) hours = 0;
    const d = new Date(dateStr);
    d.setHours(hours, parseInt(timeObj.m), 0, 0);
    return d;
  };

  const getTimeString = (timeObj) => {
      let hours = parseInt(timeObj.h);
      if (timeObj.p === "PM" && hours !== 12) hours += 12;
      if (timeObj.p === "AM" && hours === 12) hours = 0;
      return `${String(hours).padStart(2,'0')}:${timeObj.m}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const startDateTime = get24HDate(formData.date, startTime);
    const endDateTime = get24HDate(formData.date, endTime);
    const now = new Date();
    const startHour = startDateTime.getHours();

    if (startHour < 9 || startHour >= 21) {
        alert("Hospital Hours are 9:00 AM to 9:00 PM.");
        return;
    }
    if (startDateTime < now) {
        alert("Cannot book an appointment in the past!");
        return;
    }
    if (endDateTime <= startDateTime) {
        alert("End time must be after start time.");
        return;
    }

    const duration = (endDateTime - startDateTime) / 60000;
    onSave({ ...formData, time: getTimeString(startTime), duration });
  };

  return (
    <div className="fixed inset-0 bg-black/30  flex justify-end z-50 transition-all">
      <div className="w-full max-w-[400px] bg-white h-full shadow-2xl p-6 flex flex-col animate-[slideIn_0.3s_ease-out]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">New Event</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto">
          <div className="space-y-4">
             <div className="text-gray-600 font-medium bg-gray-50 p-2 rounded text-center">
                {new Date(formData.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </div>
             <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400 font-semibold">DATE</label>
                <input 
                    type="date" min={today} value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                    className="bg-white border rounded p-2 text-sm outline-none w-full"
                    required
                />
             </div>
             <div className="grid grid-cols-2 gap-3">
                <TimeSelector label="START (9 AM - 9 PM)" value={startTime} onChange={setStartTime} />
                <TimeSelector label="END TIME" value={endTime} onChange={setEndTime} />
             </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 border-b pb-2">
               <span className="text-gray-400"><UserIcon /></span>
               <input placeholder="Patient Name" className="flex-1 outline-none text-sm"
                 value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} required />
            </div>
            <div className="flex items-center gap-3 border-b pb-2">
               <span className="text-gray-400">📞</span>
               <input placeholder="Add phone number" className="flex-1 outline-none text-sm"/>
            </div>
             <div className="flex items-center gap-3 border-b pb-2">
               <span className="text-gray-400 text-xs font-bold border rounded px-1">DR</span>
               <select className="flex-1 outline-none text-sm bg-transparent cursor-pointer"
                 value={formData.doctorName} onChange={e => setFormData({...formData, doctorName: e.target.value})} >
                 <option>Dr. Sarah Johnson</option>
                 <option>Dr. Michael Chen</option>
                 <option>Dr. Emily White</option>
               </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold">PURPOSE</label>
             <textarea 
               placeholder="Add Purpose" 
               className="w-full border p-3 rounded-lg text-sm h-24 resize-none focus:ring-1 ring-blue-500 outline-none"
               value={formData.type}
               onChange={e => setFormData({...formData, type: e.target.value})}
             />
          </div>
          <div className="pt-1 mt-1">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors">
              Save Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * ==============================================================================
 * COMPONENT: CALENDAR VIEW (TIMELINE)
 * ==============================================================================
 */
const CalendarView = ({ appointments, onSwitchView, onOpenCreate, selectedDoctor, selectedDate, setSelectedDate }) => {
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

  const changeDay = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    const newDateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    setSelectedDate(newDateStr);
  };

  const getPosition = (time, duration) => {
    const [h, m] = time.split(":").map(Number);
    const startHour = 9; 
    const pixelsPerHour = 80; 
    
    if (h < startHour) return null;

    const top = ((h - startHour) * pixelsPerHour) + ((m / 60) * pixelsPerHour);
    const height = (duration / 60) * pixelsPerHour;
    return { top: `${top}px`, height: `${height}px` };
  };

  const daysAppointments = appointments.filter(a => {
      const dateMatch = a.date === selectedDate;
      const docMatch = selectedDoctor === "All Doctors" || a.doctorName === selectedDoctor;
      return dateMatch && docMatch;
  });

  return (
    <div className="flex flex-col h-screen bg-white animate-fade-in">
      <header className="border-b px-6 py-4 flex items-center justify-between bg-white shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 text-white p-2 rounded-lg"><CalendarIcon /></div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Calendar</h1>
            <p className="text-xs text-blue-600 font-medium">Viewing: {selectedDoctor}</p>
          </div>
          <button onClick={onSwitchView} className="text-sm text-gray-500 hover:text-blue-600 ml-4 font-medium transition-colors">
              ← Back to Dashboard
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedDate(getLocalTodayStr())} className="px-3 py-1 border rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">Today</button>
          <div className="flex items-center gap-2">
            <button onClick={() => changeDay(-1)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft/></button>
            <button onClick={() => changeDay(1)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight/></button>
          </div>
          <span className="font-medium text-gray-700 min-w-[200px] text-center select-none">
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg px-2 py-1 bg-gray-50">
             <span className="text-xs font-bold text-gray-500 mr-2">JUMP TO:</span>
             <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none cursor-pointer"
             />
          </div>
          <button onClick={onOpenCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            + Create
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 relative">
        <div className="relative min-w-[800px] mx-auto bg-white mb-20">
          {hours.map((hour) => (
            <div key={hour} className="flex h-20 border-b border-gray-100 group">
              <div className="w-20 text-right pr-4 text-xs text-gray-400 -mt-2 group-hover:text-gray-600">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
              <div className="flex-1 relative border-l border-gray-100">
                <div className="absolute w-full top-0 border-t border-gray-50"></div>
              </div>
            </div>
          ))}
          <div className="absolute top-0 left-20 right-0 bottom-0 pointer-events-none">
            {daysAppointments.length === 0 && (
                <div className="absolute top-20 left-10 text-gray-400 italic text-sm">
                   No appointments found for {selectedDoctor} on this date.
                </div>
            )}
            {daysAppointments.map((appt) => {
              const style = getPosition(appt.time, appt.duration);
              if (!style) return null;
              const colorClass = appt.type === 'Vaccination' ? 'bg-purple-500' : appt.type === 'Follow-up' ? 'bg-orange-400' : 'bg-blue-500';
              return (
                <div key={appt.id} className={`absolute rounded p-2 text-white text-xs shadow-md pointer-events-auto hover:opacity-90 cursor-pointer transition-transform hover:scale-[1.01] ${colorClass}`}
                  style={{ ...style, width: '95%', left: '2%' }} title={`${appt.patientName} - ${appt.time}`}
                >
                  <div className="font-semibold truncate">{appt.type || "General Checkup"}</div>
                  <div className="truncate">{appt.patientName}</div>
                  <div className="truncate text-[10px] opacity-90">{appt.time} - {appt.duration}m</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ==============================================================================
 * COMPONENT: DASHBOARD VIEW (LIST WITH TABS)
 * ==============================================================================
 */
const DashboardView = ({ appointments, onSwitchView, onOpenCreate, onStatusUpdate, selectedDoctor, setSelectedDoctor}) => {
  const [activeTab, setActiveTab] = useState("Today");

  const getFilteredList = () => {
    const today = getLocalTodayStr();
    const now = new Date();
    now.setHours(0,0,0,0);

    return appointments.filter(appt => {
      if (selectedDoctor !== "All Doctors" && appt.doctorName !== selectedDoctor) return false;

      const apptDate = new Date(appt.date);
      const apptDateNorm = new Date(apptDate); 
      apptDateNorm.setHours(0,0,0,0);
      
      if (activeTab === "Today") return appt.date === today; 
      if (activeTab === "Upcoming") return apptDateNorm > now;
      if (activeTab === "Past") return apptDateNorm < now;
      return true;
    });
  };

  const filteredList = getFilteredList();

  return (
    <div className="p-5 mx-auto animate-fade-in bg-gray-100 rounded-lg m-1 w-full">
      <header className="flex justify-between items-center mb-8 border-b border-gray-900 p-2">
        <div>
            <h1 className="text-4xl font-serif font-medium text-gray-900">Appointment Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage schedules and patient flow.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-full px-4 py-2 bg-white shadow-sm">
             <span className="text-xs font-bold text-gray-500 mr-2 uppercase tracking-wide">Doctor</span>
             <select 
               className="bg-transparent text-sm font-medium outline-none cursor-pointer text-blue-700"
               value={selectedDoctor}
               onChange={(e) => setSelectedDoctor(e.target.value)}
             >
               <option>All Doctors</option>
               <option>Dr. Sarah Johnson</option>
               <option>Dr. Michael Chen</option>
               <option>Dr. Emily White</option>
             </select>
          </div>

          <button onClick={onSwitchView} className="px-6 py-2 rounded-full bg-transparent text-blue-700 font-medium hover:bg-blue-100 transition-colors border border-black shadow-sm">
            Calendar View
          </button>
          <button onClick={onOpenCreate} className="px-6 py-2 rounded-full bg-blue-700 text-white font-medium border border-purple-100 shadow-sm hover:bg-blue-500">
            + New Appointment
          </button>
        </div>
      </header>

      <div className="bg-white rounded-t-xl border-b mb-6">
        <div className="flex w-full">
          {["Today", "Past", "Upcoming"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-center font-medium text-lg transition-all relative ${
                activeTab === tab ? "text-gray-700 bg-blue-50 border-b-2 border-blue-700" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
      </div>

      <div className="space-y-4 min-h-[400px]">
        {filteredList.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-400">
               <p className="text-lg">No appointments found.</p>
               <p className="text-sm">Check the doctor filter or selected date.</p>
            </div>
        )}
        {filteredList.map((appt) => (
          <div key={appt.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                {appt.patientName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{appt.patientName}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    appt.status === 'Confirmed' ? 'bg-blue-100 text-blue-600' :
                    appt.status === 'Completed' ? 'bg-green-100 text-green-600' :
                    appt.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-500'
                  }`}>
                    {appt.status}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                   <span className="flex items-center gap-1"><UserIcon/> {appt.doctorName}</span>
                   <span className="flex items-center gap-1"><ClockIcon/> {appt.time}</span>
                   <span className="flex items-center gap-1">📅 {appt.date}</span>
                   <span className="flex items-center gap-1"><FileIcon/> {appt.type || "Consultation"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
               {appt.status === 'Scheduled' && (
                 <div className="flex gap-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onStatusUpdate(appt.id, 'Confirmed')} className="text-green-600 hover:bg-green-50 px-2 py-1 rounded border border-transparent hover:border-green-100">Confirm</button>
                    <button onClick={() => onStatusUpdate(appt.id, 'Cancelled')} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded border border-transparent hover:border-red-100">Cancel</button>
                 </div>
               )}
               <DotsIcon />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * ==============================================================================
 * MAIN COMPONENT: APPOINTMENT MANAGEMENT VIEW
 * ==============================================================================
 */
export default function AppointmentManagementView() {
  const [currentView, setCurrentView] = useState("dashboard"); 
  const [appointments, setAppointments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [selectedDoctor, setSelectedDoctor] = useState("All Doctors");
  const [selectedDate, setSelectedDate] = useState(getLocalTodayStr());

  // FETCH
  const refreshData = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/appointments`);
        setAppointments(response.data);
    } catch (error) {
        console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

// create
  const handleCreate = async (formData) => {
    try {
      await axios.post(`${API_BASE_URL}/appointments`, formData);
      setShowCreateModal(false);
      refreshData();
    } catch (e) {
      alert("Failed to create appointment. Ensure backend is running.");
      console.error(e);
    }
  };

  //UPDATE
  const handleStatusUpdate = async (id, status) => {
    try {
        await axios.patch(`${API_BASE_URL}/appointments/${id}/status`, { status });
        refreshData();
    } catch (error) {
        console.error("Error updating status:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {currentView === "dashboard" ? (
        <DashboardView 
          appointments={appointments}
          onSwitchView={() => setCurrentView("calendar")}
          onOpenCreate={() => setShowCreateModal(true)}
          onStatusUpdate={handleStatusUpdate}
          selectedDoctor={selectedDoctor}
          setSelectedDoctor={setSelectedDoctor}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      ) : (
        <CalendarView 
          appointments={appointments}
          onSwitchView={() => setCurrentView("dashboard")}
          onOpenCreate={() => setShowCreateModal(true)}
          selectedDoctor={selectedDoctor}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      )}

      {showCreateModal && (
        <CreateAppointmentModal 
          onClose={() => setShowCreateModal(false)} 
          onSave={handleCreate} 
        />
      )}
    </div>
  );
}