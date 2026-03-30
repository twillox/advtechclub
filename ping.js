const http = require('http');

http.get('http://localhost:5000/api/auth/setup-admin', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("RESPONSE from /setup-admin:", data);
  });
}).on("error", (err) => {
  console.log("Error pinging localhost:5000 - Server might be down: " + err.message);
});
