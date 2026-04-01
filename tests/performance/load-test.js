import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, 
    { duration: '5m', target: 100 }, 
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },   
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], 
    http_req_failed: ['rate<0.1'],    
  },
};

const BASE_URL = 'http://localhost:8081';

export function setup() {

  console.log('Performance test setup completed');
}

export default function () {
 
  let healthResponse = http.get(`${BASE_URL}/actuator/health`);
  check(healthResponse, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 200ms': (r) => r.timings.duration < 200,
  });

 
  let loginResponse = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    username: 'admin@ats.com',
    password: 'admin123'
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  let loginSuccess = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 500ms': (r) => r.timings.duration < 500,
    'login has token': (r) => r.json('token') !== undefined,
  });

  let authToken = '';
  if (loginSuccess) {
    authToken = loginResponse.json('token');
  }

  
  if (authToken) {
    let candidatesResponse = http.get(`${BASE_URL}/api/candidates`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    check(candidatesResponse, {
      'candidates status is 200': (r) => r.status === 200,
      'candidates response time < 1000ms': (r) => r.timings.duration < 1000,
    });
  }

  
  let aiHealthResponse = http.get('http://localhost:8000/health');
  check(aiHealthResponse, {
    'AI health status is 200': (r) => r.status === 200,
    'AI health response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1);
}

export function teardown() {
  console.log('Performance test teardown completed');
}
