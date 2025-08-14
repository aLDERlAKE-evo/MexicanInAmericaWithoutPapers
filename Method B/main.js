// Wait for DOM to be ready before injecting Play button
document.addEventListener('DOMContentLoaded', () => {
  const url = window.location.href;
  const idMatch = url.match(/imdb\.com\/title\/(tt\d+)/);
  const imdbId = idMatch ? idMatch[1] : null;

  if (imdbId) {
    fetch(url)
      .then(response => response.text())
      .then(html => {
        // Parse HTML to get media type from meta tag
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const metaType = doc.querySelector('meta[property="og:type"]');
        let mediaType = null;
        if (metaType) {
          if (metaType.content === 'video.movie') {
            mediaType = 'movie';
          } else if (metaType.content === 'video.tv_show') {
            mediaType = 'show';
          }
        }

        // Try multiple selectors for the title element
        let titleElem = document.querySelector('[data-testid="hero-title-block__title"]');
        if (!titleElem) {
          titleElem = document.querySelector('h1'); // fallback to first h1
        }

        if (titleElem && mediaType) {
          // Create Play button
          const playBtn = document.createElement('button');
          playBtn.textContent = 'Play';

          // Matching neumorphic purple style
          playBtn.style.background = 'linear-gradient(145deg, #5b0eeb, #8abdff)';
          playBtn.style.color = '#fff';
          playBtn.style.border = 'none';
          playBtn.style.borderRadius = '12px';
          playBtn.style.padding = '8px 20px';
          playBtn.style.fontWeight = 'bold';
          playBtn.style.fontSize = '16px';
          playBtn.style.cursor = 'pointer';
          playBtn.style.boxShadow = '6px 6px 12px #c8d0e7, -6px -6px 12px #ffffff';
          playBtn.style.marginLeft = '10px';
          playBtn.style.transition = 'all 0.2s ease';

          playBtn.onmouseover = () => {
            playBtn.style.boxShadow = 'inset 4px 4px 8px #c8d0e7, inset -4px -4px 8px #ffffff';
          };
          playBtn.onmouseout = () => {
            playBtn.style.boxShadow = '6px 6px 12px #c8d0e7, -6px -6px 12px #ffffff';
          };

          playBtn.onclick = () => {
            if (mediaType === 'movie') {
              const movieUrl = `https://vidsrc.to/embed/movie/${imdbId}`;
              window.open(movieUrl, '_blank');
            } else if (mediaType === 'show') {
              const showUrl = `https://vidsrc.to/embed/tv/${imdbId}`;
              window.open(showUrl, '_blank');
            }
          };

          // Avoid duplicate button
          if (!titleElem.nextSibling || titleElem.nextSibling.textContent !== 'Play') {
            titleElem.parentNode.insertBefore(playBtn, titleElem.nextSibling);
          }
        }
      })
      .catch(() => {
        window.open(`https://imdb.com/info?error=fetch&id=${imdbId}`, '_blank');
      });
  }
});
