import {
  removeParentNodeOfType,
  findSelectedNodeOfType,
  removeSelectedNode,
  findParentNodeOfType,
} from 'prosemirror-utils';
import { NodeSelection } from 'prosemirror-state';
import { PanelType } from '@atlaskit/adf-schema';
import { Command } from '../../types';
import {
  AnalyticsEventPayload,
  ACTION,
  ACTION_SUBJECT,
  INPUT_METHOD,
  EVENT_TYPE,
  addAnalytics,
} from '../analytics';
import { pluginKey } from './types';
import { findPanel } from './utils';

export type DomAtPos = (pos: number) => { node: HTMLElement; offset: number };

export const removePanel = (): Command => (state, dispatch) => {
  const {
    schema: { nodes },
    tr,
  } = state;
  const payload: AnalyticsEventPayload = {
    action: ACTION.DELETED,
    actionSubject: ACTION_SUBJECT.PANEL,
    attributes: { inputMethod: INPUT_METHOD.TOOLBAR },
    eventType: EVENT_TYPE.TRACK,
  };

  let deleteTr = tr;
  if (findSelectedNodeOfType(nodes.panel)(tr.selection)) {
    deleteTr = removeSelectedNode(tr);
  } else if (findParentNodeOfType(nodes.panel)(tr.selection)) {
    deleteTr = removeParentNodeOfType(nodes.panel)(tr);
  }

  if (!deleteTr) {
    return false;
  }

  if (dispatch) {
    dispatch(addAnalytics(state, deleteTr, payload));
  }
  return true;
};

export const changePanelType = (panelType: PanelType): Command => (
  state,
  dispatch,
) => {
  const {
    schema: { nodes },
    tr,
  } = state;

  let previousType: PanelType = pluginKey.getState(state).activePanelType;
  const payload: AnalyticsEventPayload = {
    action: ACTION.CHANGED_TYPE,
    actionSubject: ACTION_SUBJECT.PANEL,
    attributes: {
      newType: panelType,
      previousType: previousType,
    },
    eventType: EVENT_TYPE.TRACK,
  };

  const panelNode = findPanel(state);
  if (panelNode === undefined) {
    return false;
  }

  const newTr = tr
    .setNodeMarkup(panelNode.pos, nodes.panel, { panelType })
    .setMeta(pluginKey, { activePanelType: panelType });

  // Select the panel if it was previously selected
  const newTrWithSelection =
    state.selection instanceof NodeSelection &&
    state.selection.node.type.name === 'panel'
      ? newTr.setSelection(new NodeSelection(tr.doc.resolve(panelNode.pos)))
      : newTr;

  const changePanelTypeTr = addAnalytics(state, newTrWithSelection, payload);

  changePanelTypeTr.setMeta('scrollIntoView', false);

  if (dispatch) {
    dispatch(changePanelTypeTr);
  }
  return true;
};
