import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { genericJerseyConfig, genericJerseyDocument, genericJerseyExport, GENERIC_REVISION } from '../src/lib/generic-jersey.js';
import { editableParts, applyEdits } from '../src/lib/kit-edit.js';
import { renderColorArtwork } from '../src/lib/png-shirt.js';

test('generic default preserves selected shoulder-to-hem paint and both surface variants', async () => {
  const preview = JSON.parse(await fs.readFile('artifacts/generic-jersey/r005-preview/paint.config.json', 'utf8'));
  const config = genericJerseyConfig();
  assert.equal(GENERIC_REVISION, 'r005');
  assert.equal(renderColorArtwork(config), renderColorArtwork(preview));
  assert.equal(genericJerseyConfig('on-light').layers[0].d, preview.layers[0].d);
  assert.notEqual(genericJerseyConfig('on-light').colors.body, config.colors.body);
  assert.deepEqual(JSON.parse(await fs.readFile('public/catalog/generic-jersey.json', 'utf8')), genericJerseyDocument());
  assert.throws(() => genericJerseyConfig('unknown'));
});

test('N edits are independent of sleeve/shoulder colours and cannot mutate the default', () => {
  const original = genericJerseyConfig();
  const fill = editableParts(original).find(part => part.id.startsWith('fill:')).id;
  const edited = applyEdits(original, {[fill]: '#22CC88', 'role:leftSleeve': '#33AA77'});
  assert.equal(edited.layers[0].fill, '#22CC88');
  assert.equal(edited.layers[1].colorRole, 'leftSleeve');
  assert.equal(edited.colors.leftSleeve, '#33AA77');
  assert.equal(edited.colors.rightSleeve, original.colors.rightSleeve);
  const exported = genericJerseyExport('on-dark', edited, true);
  assert.equal(exported.custom, true);
  assert.equal(exported.revision, 'r005');
  assert.deepEqual(exported.config, edited);
  exported.config.layers[0].d = 'M0 0Z';
  assert.equal(genericJerseyConfig().layers[0].d, original.layers[0].d);
  assert.notEqual(genericJerseyConfig().layers[0].fill, edited.layers[0].fill);
  assert.throws(() => genericJerseyExport('on-dark', {...edited, layers: [{type:'script'}]}, true));
});
