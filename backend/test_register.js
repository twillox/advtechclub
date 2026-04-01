const axios = require('axios');
async function test() {
  try {
    const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login', {email: 'user@university.edu', password: 'user123'});
    const token = loginRes.data.token;
    console.log("LOGIN SUCCESS");

    const eventsRes = await axios.get('http://127.0.0.1:5000/api/events', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (eventsRes.data.length === 0) {
       console.log("NO EVENTS FOUND");
       return;
    }
    const eventId = eventsRes.data[0]._id;
    console.log("REGISTERING FOR EVENT:", eventId);

    const regRes = await axios.post(`http://127.0.0.1:5000/api/events/${eventId}/register`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("REGISTER SUCCESS:", regRes.data);

    const adminLogin = await axios.post('http://127.0.0.1:5000/api/auth/login', {email: 'admin@university.edu', password: 'adminpassword'});
    const adminToken = adminLogin.data.token;

    const registrationsRes = await axios.get(`http://127.0.0.1:5000/api/events/${eventId}/registrations`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log("REGISTRATIONS FETCHED:", registrationsRes.data.registrations.length);

  } catch(e) {
    if (e.response && e.response.data) {
       console.error("ERROR:", e.response.status, e.response.data);
    } else {
       console.error("ERROR:", e.message);
    }
  }
}
test();
