const axios = require('axios');

/**
 * Searches YouTube for a given query and returns the top N video results.
 * This uses a lightweight axios request and parses the embedded ytInitialData,
 * avoiding the need for heavy headless browsers or API keys.
 * 
 * @param {string} query The search query (e.g. "BMW P0171 repair")
 * @param {number} limit Maximum number of videos to return
 * @returns {Promise<Array<{title: string, url: string, duration: number, source: string}>>}
 */
async function searchYouTubeVideos(query, limit = 3) {
  try {
    // &sp=EgIoAQ%253D%253D forces YouTube to only return videos with Closed Captions (CC)
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIoAQ%253D%253D`;
    
    // Add user-agent to pretend we are a real browser, otherwise YouTube might serve a fallback page
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const html = response.data;
    
    // ytInitialData contains the state of the React application
    const match = html.match(/var ytInitialData = (.*?)};/);
    if (!match) {
      console.warn("Could not find ytInitialData in YouTube response.");
      return [];
    }

    const dataString = match[1] + "}";
    const data = JSON.parse(dataString);

    const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
    if (!contents || !contents.length) return [];

    const itemSection = contents.find(c => c.itemSectionRenderer)?.itemSectionRenderer?.contents;
    if (!itemSection) return [];

    const results = [];
    for (const item of itemSection) {
      if (results.length >= limit) break;

      const video = item.videoRenderer;
      if (video && video.videoId) {
        // Parse duration if available (e.g., "5:20" -> 320 seconds)
        let durationSeconds = null;
        if (video.lengthText && video.lengthText.simpleText) {
          const parts = video.lengthText.simpleText.split(':').reverse();
          let seconds = 0;
          for (let i = 0; i < parts.length; i++) {
            seconds += parseInt(parts[i]) * Math.pow(60, i);
          }
          durationSeconds = seconds;
        }

        results.push({
          title: video.title?.runs?.[0]?.text || "Bilinmeyen Başlık",
          url: `https://www.youtube.com/watch?v=${video.videoId}`,
          duration: durationSeconds,
          source: "YouTube",
          thumbnail: `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`
        });
      }
    }

    return results;

  } catch (error) {
    console.error(`Error searching YouTube for "${query}":`, error.message);
    return [];
  }
}

module.exports = { searchYouTubeVideos };
