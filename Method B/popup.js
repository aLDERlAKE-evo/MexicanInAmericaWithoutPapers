function parseImdbId(url) {
  const idMatch = url.match(/imdb\.com\/title\/(tt\d+)/);
  return idMatch ? idMatch[1] : null;
}

document.addEventListener('DOMContentLoaded', async () => {
  const playBtn = document.getElementById('playBtn');
  const statusDiv = document.getElementById('status');
  const nameDiv = document.getElementById('mediaName');

  playBtn.setAttribute('aria-label', 'Play this media');
  playBtn.tabIndex = 0;
  playBtn.disabled = true;
  statusDiv.textContent = 'Loading...';

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url) {
      statusDiv.textContent = 'No active tab detected.';
      return;
    }

    const url = tab.url;
    const imdbId = parseImdbId(url);
    if (!imdbId) {
      playBtn.disabled = true;
      statusDiv.textContent = 'Not an IMDb movie/show page.';
      return;
    }

    chrome.runtime.sendMessage({ type: 'getMediaType', url }, async (response) => {
      const mediaType = response.mediaType;
      let showName = '';

      try {
        const res = await fetch(url);
        const html = await res.text();
        const titleMatch = html.match(/<title>(.*?)\s*-\s*IMDb<\/title>/);
        if (titleMatch) {
          showName = titleMatch[1].trim();
        }
      } catch (err) {
        console.error('Error fetching IMDb title:', err);
      }

      if (showName) nameDiv.textContent = showName;

      if (!mediaType) {
        playBtn.disabled = true;
        statusDiv.textContent = 'Could not determine media type.';
        return;
      }

      // Enable and attach functionality
      playBtn.disabled = false;
      statusDiv.textContent = '';
      playBtn.onclick = () => {
        let targetUrl = '';
        if (mediaType === 'movie') {
          targetUrl = `https://vidsrc.to/embed/movie/${imdbId}`;
        } else if (mediaType === 'show') {
          targetUrl = `https://vidsrc.to/embed/tv/${imdbId}`;
        }
        if (targetUrl) {
          chrome.tabs.create({ url: targetUrl });
        }
      };

      playBtn.onkeyup = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          playBtn.click();
        }
      };
    });
  });
});
