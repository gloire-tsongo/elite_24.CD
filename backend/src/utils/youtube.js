function youtubeVideoId(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be'].includes(url.hostname)) return null;
    if (url.hostname.includes('youtu.be')) return url.pathname.slice(1).split('/')[0] || null;
    if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2] || null;
    if (url.pathname === '/watch') return url.searchParams.get('v');
    if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2] || null;
  } catch {}
  return null;
}

function youtubeEmbedUrl(value) {
  const id = youtubeVideoId(value);
  return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
}

module.exports = { youtubeVideoId, youtubeEmbedUrl };
