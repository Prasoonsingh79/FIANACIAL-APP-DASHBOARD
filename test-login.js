const axios = require('axios');

axios.post('http://localhost:5000/api/auth/login', {
  email: 'admin@finance.com',
  password: 'admin123'
})
.then(response => console.log('Success:', response.data))
.catch(error => console.log('Error:', error.response?.data || error.message));