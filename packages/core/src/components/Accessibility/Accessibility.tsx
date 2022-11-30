import {useUniqueId} from '@kousum/utilities';
import {HiddenText, LiveRegion, useAnnouncement} from '@kousum/accessibility';

import {DndMonitorListener, useDndMonitor} from '../DndMonitor';

import type {Announcements, ScreenReaderInstructions} from './types';
import {
  defaultAnnouncements,
  defaultScreenReaderInstructions,
} from './defaults';
import {ref, watchEffect, Teleport, h, Fragment} from "vue";

interface Props {
  announcements?: Announcements;
  container?: Element;
  screenReaderInstructions?: ScreenReaderInstructions;
  hiddenTextDescribedById: string;
}

export function Accessibility({
  announcements = defaultAnnouncements,
  container,
  hiddenTextDescribedById,
  screenReaderInstructions = defaultScreenReaderInstructions,
}: Props) {
  const {announce, announcement} = useAnnouncement();
  const liveRegionId = useUniqueId(`DndLiveRegion`);
  const mounted = ref(false);

  watchEffect(() => {
    mounted.value = true
  });

  useDndMonitor({
    onDragStart({active}) {
      announce(announcements.onDragStart({active}));
    },
    onDragMove({active, over}) {
      if (announcements.onDragMove) {
        announce(announcements.onDragMove({active, over}));
      }
    },
    onDragOver({active, over}) {
      announce(announcements.onDragOver({active, over}));
    },
    onDragEnd({active, over}) {
      announce(announcements.onDragEnd({active, over}));
    },
    onDragCancel({active, over}) {
      announce(announcements.onDragCancel({active, over}));
    },
  });

  if (!mounted) {
    return null;
  }

  const markup = (
    <Fragment>
      <HiddenText
        id={hiddenTextDescribedById}
        value={screenReaderInstructions.draggable}
      />
      <LiveRegion id={liveRegionId.value} announcement={announcement.value} />
    </Fragment>
  );


  return container ? <Teleport to={container}>{markup}</Teleport> : markup;
}
