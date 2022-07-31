import {CSSProperties} from "vue";

interface Props {
  id: string;
  value: string;
}

const hiddenStyles: CSSProperties = {
  display: 'none',
};

export function HiddenText({id, value}: Props) {
  return (
    <div id={id} style={hiddenStyles}>
      {value}
    </div>
  );
}
