const test = require('node:test');
const assert = require('node:assert/strict');
const { youtubeVideoId, youtubeEmbedUrl } = require('../src/utils/youtube');

test('youtubeVideoId extrait un identifiant YouTube valide', () => {
  assert.equal(youtubeVideoId('https://www.youtube.com/watch?v=abcdefghijk'), 'abcdefghijk');
  assert.equal(youtubeVideoId('https://youtu.be/abcdefghijk'), 'abcdefghijk');
});

test('youtubeVideoId rejette une URL non YouTube', () => {
  assert.equal(youtubeVideoId('https://example.com/video'), null);
});

test('youtubeEmbedUrl produit une URL privacy-enhanced', () => {
  assert.equal(
    youtubeEmbedUrl('https://youtu.be/abcdefghijk'),
    'https://www.youtube-nocookie.com/embed/abcdefghijk'
  );
});
