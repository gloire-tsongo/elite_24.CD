function youtubeVideoId(value) {
  if (!value) return null;
  try {
    const url = new URL(String(value).trim());
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
    let id = null;
    if (hostname === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0] || null;
    else if (['youtube.com', 'youtube-nocookie.com'].includes(hostname)) {
      if (url.pathname === '/watch') id = url.searchParams.get('v');
      else {
        const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/);
        if (match) id = match[1];
      }
    }
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch {}
  return null;
}

function youtubeEmbedUrl(value) {
  const id = youtubeVideoId(value);
  return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
}

module.exports = { youtubeVideoId, youtubeEmbedUrl };
