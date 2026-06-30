const { YoutubeTranscript } = require('youtube-transcript');

async function test() {
  try {
    // A famous repair video (ChrisFix or similar)
    const transcript = await YoutubeTranscript.fetchTranscript('https://www.youtube.com/watch?v=s5RlaUoNfB0');
    console.log('Success! Transcript length:', transcript.length);
    console.log('First 3 lines:', transcript.slice(0, 3).map(t => t.text));
  } catch (err) {
    console.error('Error fetching transcript:', err.message);
  }
}

test();
