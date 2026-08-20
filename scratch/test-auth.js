process.env.NEXT_PHASE = '';
process.env.IS_BUILD = '';
process.env.AUTH_SECRET = '';
process.env.NEXTAUTH_SECRET = '';

try {
  require('../src/auth.js');
} catch (err) {
  console.log("NEGATIVE_TEST_RESULT: " + err.message);
}
