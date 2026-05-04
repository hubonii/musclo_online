// Builds autocannon scenario definitions for perf script execution.
const buildScenarios = ({ credentials, authCookie }) => {
  // Login scenario body reused as JSON string by autocannon.
  const loginPayload = JSON.stringify({
    email: credentials.email,
    password: credentials.password,
  });

  // Mix one auth step + a few protected reads to represent common traffic.
  return [
    {
      name: 'auth.login',
      method: 'POST',
      path: '/api/login',
      headers: {
        'content-type': 'application/json',
      },
      body: loginPayload,
      requiresAuth: false,
    },
    {
      name: 'analytics.stats',
      method: 'GET',
      path: '/api/analytics/stats',
      headers: {
        cookie: authCookie,
      },
      requiresAuth: true,
    },
    {
      name: 'exercises.list',
      method: 'GET',
      path: '/api/exercises',
      headers: {
        cookie: authCookie,
      },
      requiresAuth: true,
    },
    {
      name: 'workouts.history',
      method: 'GET',
      path: '/api/workouts/history',
      headers: {
        cookie: authCookie,
      },
      requiresAuth: true,
    },
  ];
};

// Exported factory keeps scenario generation configurable by caller credentials/cookie.
module.exports = { buildScenarios };


