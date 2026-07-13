const axios = require('axios');
const fs = require('fs');
const path = require('path');

const token = process.env.GOOGLE_OAUTH_TOKEN || "ya29.removed-for-security";

async function testGbp() {
  try {
    // 1. Fetch Accounts
    console.log('Fetching accounts...');
    const accountsRes = await axios.get('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const accountsData = accountsRes.data;
    console.log('Accounts:', JSON.stringify(accountsData, null, 2));

    if (!accountsData.accounts || accountsData.accounts.length === 0) {
      console.log('NO ACCOUNTS FOUND');
      return;
    }
    const accountName = accountsData.accounts[0].name;

    // 2. Fetch Locations
    console.log(`\nFetching locations for ${accountName}...`);
    const locationsRes = await axios.get(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const locationsData = locationsRes.data;
    console.log('Locations:', JSON.stringify(locationsData, null, 2));

    if (!locationsData.locations || locationsData.locations.length === 0) {
      console.log('NO LOCATIONS FOUND');
      return;
    }
    const locationName = locationsData.locations[0].name;

    console.log(`\nReady to post to: ${locationName} (${locationsData.locations[0].title})`);

    // Let's create a test post for the first article
    const postBody = {
      languageCode: "tr",
      summary: "Fethiye premium oto servisimizde Audi A6 C7 Aktif Motor Takozu (Motor Mount) Patlaması sorununu garantili orijinal parçalarla çözüyoruz. Detaylı teknik bilgi ve randevu için makalemizi inceleyin.",
      callToAction: {
        actionType: "LEARN_MORE",
        url: "https://www.bursaliotoservis.com/tr/ariza-cozumleri/audi-a6-c7-aktif-motor-takozu-motor-mount-patlamasi"
      }
    };

    console.log('\nCreating test post...');
    const postRes = await axios.post(`https://mybusiness.googleapis.com/v4/${accountName}/${locationName}/localPosts`, postBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Post Response:', JSON.stringify(postRes.data, null, 2));

  } catch (err) {
    if (err.response) {
      console.error('API Error:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
  }
}

testGbp();
