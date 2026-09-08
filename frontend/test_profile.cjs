const axios = require('axios');
(async () => {
  try {
    const ts = Date.now();
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: 'test' + ts + '@example.com',
      password: 'password123',
      year: '3rd Year',
      department: 'CS',
      bio: 'Testing profile'
    });
    const token = res.data.token;
    
    const putRes = await axios.put('http://localhost:5000/api/auth/profile', {
      department: 'CS',
      semester: '6th',
      cgpa: 3.8,
      skills: ['React'],
      clubsJoined: [],
      certifications: [],
      areasOfInterest: [],
      preferredStudyTopics: []
    }, {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log(putRes.data);
  } catch (err) {
    console.log('ERROR STATUS:', err.response ? err.response.status : 'NO RESPONSE');
    console.log('ERROR DATA:', err.response ? err.response.data : err.message);
  }
})();
