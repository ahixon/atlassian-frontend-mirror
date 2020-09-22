import { Node as PMNode } from 'prosemirror-model';
import {
  Step,
  StepResult,
  StepMap,
  ReplaceStep,
  Mappable,
} from 'prosemirror-transform';
import { Slice } from 'prosemirror-model';

export const analyticsStepType = 'atlaskit-analytics';

export type HandleAnalyticsEvent<P extends AnalyticsPayload> = (
  payload: P,
  channel: string,
) => void;

export interface AnalyticsPayload {
  action: string;
  actionSubject: string;
  actionSubjectId?: string | null;
  attributes?: Record<string, any>;
  eventType: string;
}

export interface AnalyticsWithChannel<P extends AnalyticsPayload> {
  payload: P;
  channel: string;
}

enum HISTORY_ACTIONS {
  UNDID = 'undid',
  REDID = 'redid',
}
interface UndoAnalyticsEventPayload {
  action: HISTORY_ACTIONS.UNDID;
  actionSubject: string;
  actionSubjectId?: string;
  attributes?: Record<string, any>;
  eventType: string;
}
interface RedoAnalyticsEventPayload {
  action: HISTORY_ACTIONS.REDID;
  actionSubject: string;
  actionSubjectId?: string;
  attributes?: Record<string, any>;
  eventType: string;
}

/** Creates undo event from a normal analytics event */
function createUndoEvent<P extends AnalyticsPayload>(
  analyticsEvent: AnalyticsWithChannel<P>,
): AnalyticsWithChannel<UndoAnalyticsEventPayload> {
  return {
    ...analyticsEvent,
    payload: {
      action: HISTORY_ACTIONS.UNDID,
      actionSubject: analyticsEvent.payload.actionSubject,
      actionSubjectId: analyticsEvent.payload.action,
      attributes: {
        ...analyticsEvent.payload.attributes,
        actionSubjectId: analyticsEvent.payload.actionSubjectId,
      },
      eventType: 'track',
    },
  };
}

/** Toggles event action between undo & redo */
const toggleEventAction = (
  analyticsEvent: AnalyticsWithChannel<
    UndoAnalyticsEventPayload | RedoAnalyticsEventPayload
  >,
): AnalyticsWithChannel<
  UndoAnalyticsEventPayload | RedoAnalyticsEventPayload
> => ({
  ...analyticsEvent,
  payload: {
    ...analyticsEvent.payload,
    action:
      analyticsEvent.payload.action === HISTORY_ACTIONS.UNDID
        ? HISTORY_ACTIONS.REDID
        : HISTORY_ACTIONS.UNDID,
  },
});

function isHistoryAnalyticsEvent(
  event: AnalyticsWithChannel<AnalyticsPayload>,
): event is AnalyticsWithChannel<
  UndoAnalyticsEventPayload | RedoAnalyticsEventPayload
> {
  return (
    event.payload.action === HISTORY_ACTIONS.UNDID ||
    event.payload.action === HISTORY_ACTIONS.REDID
  );
}

/**
 * Custom Prosemirror Step to fire our GAS V3 analytics events
 * Using a Step means that it will work with prosemirror-history and we get
 * undo/redo events for free
 */
export class AnalyticsStep<P extends AnalyticsPayload> extends Step {
  analyticsEvents: AnalyticsWithChannel<P>[] = [];
  handleAnalyticsEvent: HandleAnalyticsEvent<P>;
  pos?: number;
  private actionsToIgnore: string[] = [];

  constructor(
    handleAnalyticsEvent: HandleAnalyticsEvent<P>,
    analyticsEvents: AnalyticsWithChannel<P>[],
    actionsToIgnore: string[] = [],
    pos?: number, // Used to create the map, prevent splitting history.
  ) {
    super();
    this.handleAnalyticsEvent = handleAnalyticsEvent;
    this.analyticsEvents = analyticsEvents;
    this.actionsToIgnore = actionsToIgnore;
    this.pos = pos;
  }

  /**
   * Generate new undo/redo analytics event when step is inverted
   */
  invert() {
    const analyticsEvents: AnalyticsWithChannel<P>[] = this.analyticsEvents
      .filter(
        analyticsEvent =>
          this.actionsToIgnore.indexOf(analyticsEvent.payload.action) === -1,
      )
      .map(analyticsEvent => {
        if (isHistoryAnalyticsEvent(analyticsEvent)) {
          return toggleEventAction(analyticsEvent) as AnalyticsWithChannel<P>;
        } else {
          return createUndoEvent(analyticsEvent) as AnalyticsWithChannel<P>;
        }
      });

    return new AnalyticsStep(this.handleAnalyticsEvent, analyticsEvents);
  }

  apply(doc: PMNode) {
    for (const analyticsEvent of this.analyticsEvents) {
      this.handleAnalyticsEvent(analyticsEvent.payload, analyticsEvent.channel);
    }

    return StepResult.ok(doc);
  }

  map(mapping: Mappable) {
    let newPos = this.pos;
    if (typeof newPos === 'number') {
      newPos = mapping.map(newPos);
    }
    // Return the same events, this step will never be removed
    return new AnalyticsStep(
      this.handleAnalyticsEvent,
      this.analyticsEvents,
      this.actionsToIgnore,
      newPos,
    );
  }

  getMap() {
    if (typeof this.pos === 'number') {
      return new StepMap([this.pos, 0, 0]);
    }
    return new StepMap([]);
  }

  merge(other: Step) {
    if (other instanceof AnalyticsStep) {
      const otherAnalyticsEvents = (other as AnalyticsStep<P>)
        .analyticsEvents as AnalyticsWithChannel<P>[];
      return new AnalyticsStep(this.handleAnalyticsEvent, [
        ...otherAnalyticsEvents,
        ...this.analyticsEvents,
      ]);
    }
    return null;
  }

  toJSON() {
    return {
      stepType: analyticsStepType,
    };
  }

  static fromJSON() {
    return new ReplaceStep(0, 0, Slice.empty);
  }
}

/** Register this step with Prosemirror */
Step.jsonID(analyticsStepType, AnalyticsStep);
