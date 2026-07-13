const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function testGbpServiceAccount() {
  try {
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/business.manage'],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();
    const accessToken = token.token;

    const accountName = 'accounts/103164968887207689971';

    console.log(`Fetching locations for ${accountName}...`);
    const locationsRes = await axios.get(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log('Locations:', JSON.stringify(locationsRes.data, null, 2));

  } catch (err) {
    if (err.response) {
      console.error('API Error:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
  }
}

testGbpServiceAccount();
