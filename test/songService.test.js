const test = require('node:test');
const assert = require('node:assert/strict');
const { getSongById } = require('../services/songService');

test('getSongById returns a song for a known fallback ID', async () => {
  const song = await getSongById(1);
  assert.ok(song);
  assert.equal(song.id, 1);
  assert.equal(typeof song.title, 'string');
});

test('getSongById returns null for an unknown ID', async () => {
  const song = await getSongById(999999);
  assert.equal(song, null);
});
