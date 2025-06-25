
import Svg, { Line } from 'react-native-svg';
const SCALE = 30;
const GridLines = ({ width, height }) => {
  const lines = [];

  const step = SCALE * 2; // 2ft spacing

  // Vertical lines every 2ft
  for (let x = 0; x <= width; x += step) {
    lines.push(
      <Line
        key={`v-${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke="#ccc"
        strokeWidth="0.5"
      />
    );
  }

  // Horizontal lines every 2ft
  for (let y = 0; y <= height; y += step) {
    lines.push(
      <Line
        key={`h-${y}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke="#ccc"
        strokeWidth="0.5"
      />
    );
  }

  return (
    <Svg
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    >
      {lines}
    </Svg>
  );
};

export default GridLines;