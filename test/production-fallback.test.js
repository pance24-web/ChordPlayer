process.env.NODE_ENV = 'production';
const assert = require('node:assert/strict');
const test = require('node:test');
const { getAllSongs, getSongById } = require('../services/songService');

test('production fallback returns songs when database is unavailable', async () => {
  const songs = await getAllSongs();
  assert.ok(Array.isArray(songs));
  assert.ok(songs.length > 0);
  assert.equal(songs[0].chord, undefined);

  const song = await getSongById(1);
  assert.equal(song.id, 1);
  assert.ok(song.chord);
});
