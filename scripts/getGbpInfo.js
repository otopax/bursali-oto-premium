const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function getGbpInfo() {
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

    // Fetch Accounts
    console.log('Fetching accounts...');
    const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: { Authorization: `Bearer ${token.token}` }
    });
    const accountsData = await accountsRes.json();
    
    if (!accountsData.accounts || accountsData.accounts.length === 0) {
      console.log('NO_ACCOUNTS_FOUND');
      return;
    }

    console.log(JSON.stringify(accountsData.accounts, null, 2));
    const accountName = accountsData.accounts[0].name;

    // Fetch Locations for the first account
    console.log(`Fetching locations for account: ${accountName}`);
    const locationsRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title`, {
      headers: { Authorization: `Bearer ${token.token}` }
    });
    
    const locationsData = await locationsRes.json();
    console.log(JSON.stringify(locationsData, null, 2));

    if (locationsData.locations && locationsData.locations.length > 0) {
      console.log(`\nFound Location: ${locationsData.locations[0].name} (${locationsData.locations[0].title})`);
      console.log(`Please update .env.local with:`);
      console.log(`GBP_ACCOUNT_ID="${accountName}"`);
      console.log(`GBP_LOCATION_ID="${locationsData.locations[0].name}"`);
    } else {
      console.log('NO_LOCATIONS_FOUND');
    }

  } catch (error) {
    console.error('Error fetching GBP info:', error);
  }
}

getGbpInfo();
