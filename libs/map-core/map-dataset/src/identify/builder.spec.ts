import { describe, expect, it } from 'vitest';
import { createDatasetPartIdentifyComponentBuilder } from './builder';
import {
  createIdentifyMapboxComponent,
  createIdentifyMapboxMergedComponent,
  ensureIdentifyShowDetailMenu,
} from './models';
import { LIST_VIEW_MENU_ID } from '../menu/items';

describe('identify model', () => {
  it('createIdentifyMapboxComponent sets type identify', () => {
    const identify = createIdentifyMapboxComponent('Test identify', {
      field_id: 'id',
      field_name: 'name',
    });
    expect(identify.type).toBe('identify');
    expect(identify.getName()).toBe('Test identify');
    expect(identify.config.field_id).toBe('id');
  });

  it('createIdentifyMapboxMergedComponent uses merge group id', () => {
    const identify = createIdentifyMapboxMergedComponent(
      'Merged',
      { preferResultControl: true },
      'mapbox-group',
    );
    expect(identify.type).toBe('identify');
    expect(identify.config.preferResultControl).toBe(true);
  });

  it('builder wires fields and show-detail menu', () => {
    const identify = createDatasetPartIdentifyComponentBuilder('Builder id')
      .configFieldId('fid')
      .configFieldName('fname')
      .preferResultControl()
      .setConfigFields([
        { text: 'Name', value: 'name' },
        { text: 'Id', value: 'fid' },
      ])
      .build();

    expect(identify.type).toBe('identify');
    expect(identify.config.field_id).toBe('fid');
    expect(identify.config.preferResultControl).toBe(true);
    expect(identify.hasMenu(LIST_VIEW_MENU_ID.item.showDetail)).toBe(true);
  });

  it('ensureIdentifyShowDetailMenu is a no-op without fields', () => {
    const identify = createIdentifyMapboxComponent('Empty', {});
    ensureIdentifyShowDetailMenu(identify);
    expect(identify.hasMenu(LIST_VIEW_MENU_ID.item.showDetail)).toBe(false);
  });

  it('builder isUseMerge creates merged identify node', () => {
    const identify = createDatasetPartIdentifyComponentBuilder('Merge')
      .isUseMerge('custom-group')
      .build();
    expect(identify.type).toBe('identify');
  });
});
