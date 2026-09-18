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
      { onSingle: 'result', onMultiple: 'result' },
      'mapbox-group',
    );
    expect(identify.type).toBe('identify');
    expect(identify.config.onSingle).toBe('result');
  });

  it('builder wires fields and show-detail menu', () => {
    const identify = createDatasetPartIdentifyComponentBuilder('Builder id')
      .configFieldId('fid')
      .configFieldName('fname')
      .onSingle('result')
      .onMultiple('result')
      .setConfigFields([
        { text: 'Name', value: 'name' },
        { text: 'Id', value: 'fid' },
      ])
      .build();

    expect(identify.type).toBe('identify');
    expect(identify.config.field_id).toBe('fid');
    expect(identify.config.onSingle).toBe('result');
    expect(identify.config.onMultiple).toBe('result');
    expect(identify.hasMenu(LIST_VIEW_MENU_ID.item.showDetail)).toBe(true);
  });

  it('ensureIdentifyShowDetailMenu is a no-op without fields', () => {
    const identify = createIdentifyMapboxComponent('Empty', {});
    ensureIdentifyShowDetailMenu(identify);
    expect(identify.hasMenu(LIST_VIEW_MENU_ID.item.showDetail)).toBe(false);
  });

  it('builder wires onSingle / onMultiple hit policies', () => {
    const identify = createDatasetPartIdentifyComponentBuilder('Policy')
      .onSingle('detail')
      .onMultiple('table')
      .build();
    expect(identify.config.onSingle).toBe('detail');
    expect(identify.config.onMultiple).toBe('table');
  });

  it('builder isUseMerge creates merged identify node', () => {
    const identify = createDatasetPartIdentifyComponentBuilder('Merge')
      .isUseMerge('custom-group')
      .build();
    expect(identify.type).toBe('identify');
  });
});
