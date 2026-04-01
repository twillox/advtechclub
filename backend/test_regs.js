const axios = require('axios');
async function run() {
  try {
    const login = await axios.post('http://127.0.0.1:5000/api/auth/login', {email: 'admin@university.edu', password: 'adminpassword'});
    const token = login.data.token;
    
    const events = await axios.get('http://127.0.0.1:5000/api/events', { headers: { Authorization: `Bearer ${token}` }});
    const ev = events.data[0];
    if(!ev) return console.log("NO EVENT");

    const regs = await axios.get(`http://127.0.0.1:5000/api/events/${ev._id}/registrations`, { headers: { Authorization: `Bearer ${token}` }});
    console.log(JSON.stringify(regs.data, null, 2));

  } catch(err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
run();
