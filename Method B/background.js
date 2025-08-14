// Listen for messages from popup.js to fetch IMDb page and return media type
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getMediaType' && request.url) {
    fetch(request.url)
      .then(response => response.text())
      .then(html => {
        let mediaType = null;
        const metaMatch = html.match(/<meta[^>]*property=["']og:type["'][^>]*content=["']([^"']+)["']/);
        if (metaMatch) {
          if (metaMatch[1] === 'video.movie') mediaType = 'movie';
          else if (metaMatch[1] === 'video.tv_show') mediaType = 'show';
        }
        sendResponse({ mediaType });
      })
      .catch(() => {
        sendResponse({ mediaType: null });
      });
    return true; // Indicates async response
  }
});
