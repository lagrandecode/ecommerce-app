const http = require('http');

function testRegistration() {
  const postData = JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  });

  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Registration Response:');
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    });
  });

  req.on('error', (e) => {
    console.log('❌ Registration failed!');
    console.log(`Error: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

console.log('Testing registration endpoint...');
testRegistration(); 