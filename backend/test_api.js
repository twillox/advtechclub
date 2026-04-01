const axios = require('axios');
async function test() {
  try {
    const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login', { email: 'user@university.edu', password: 'user123' });
    const token = loginRes.data.token;
    console.log("LOGIN SUCCESS, token:", token);

    const profileRes = await axios.put('http://127.0.0.1:5000/api/user/profile', {
      name: "Normal User", username: "user"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("PROFILE UPDATE SUCCESS", profileRes.data.username);
  } catch (e) {
    console.error("ERROR in test script:", e.response ? Object.assign(e.response.data, { status: e.response.status }) : e.message);
  }
}
test();
