import {type CSSProperties, h} from "vue";

export interface Props {
  id: string;
  announcement: string;
}

// Hide element visually but keep it readable by screen readers
const visuallyHidden: CSSProperties = {
  position: 'fixed',
  width: 1,
  height: 1,
  margin: -1,
  border: 0,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(100%)',
  whiteSpace: 'nowrap',
};

export function LiveRegion({id, announcement}: Props) {
  return (
    <div
      id={id}
      style={visuallyHidden}
      role="status"
      aria-live="assertive"
      aria-atomic
    >
      {announcement}
    </div>
  );
}
