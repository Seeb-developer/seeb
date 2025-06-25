import React from 'react';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';

const BRICK_WIDTH = 15;
const BRICK_HEIGHT = 15;
const GAP = 0;
const SCALE = 30; // Ensure it's the same as used in your main file

function BrickBorder({ width, height }) {
  const outerWidth = width + BRICK_WIDTH * 2;
  const outerHeight = height + BRICK_HEIGHT * 2;
  const rows = Math.ceil(outerHeight / BRICK_HEIGHT);
  const cols = Math.ceil(outerWidth / BRICK_WIDTH);
  const bricks = [];

  // Brick border rectangles
  for (let i = 0; i < cols; i++) {
    bricks.push(
      <Rect
        key={`top-${i}`}
        x={i * BRICK_WIDTH}
        y={0}
        width={BRICK_WIDTH - GAP}
        height={BRICK_HEIGHT - GAP}
        fill="#000"
      />,
      <Rect
        key={`bottom-${i}`}
        x={i * BRICK_WIDTH}
        y={outerHeight - BRICK_HEIGHT}
        width={BRICK_WIDTH - GAP}
        height={BRICK_HEIGHT - GAP}
        fill="#000"
      />
    );
  }

  for (let i = 1; i < rows - 1; i++) {
    bricks.push(
      <Rect
        key={`left-${i}`}
        x={0}
        y={i * BRICK_HEIGHT}
        width={BRICK_WIDTH - GAP}
        height={BRICK_HEIGHT - GAP}
        fill="#000"
      />,
      <Rect
        key={`right-${i}`}
        x={outerWidth - BRICK_WIDTH}
        y={i * BRICK_HEIGHT}
        width={BRICK_WIDTH - GAP}
        height={BRICK_HEIGHT - GAP}
        fill="#000"
      />
    );
  }

  return (
    <Svg
      width={outerWidth + 50}
      height={outerHeight + 50}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {/* Brick border */}
      {bricks}

      {/* Bottom Arrow for Width */}
      <Line
        x1={BRICK_WIDTH}
        y1={outerHeight + 30}
        x2={outerWidth - BRICK_WIDTH}
        y2={outerHeight + 30}
        stroke="black"
        strokeWidth="2"
      />
      <Line
        x1={BRICK_WIDTH}
        y1={outerHeight + 25}
        x2={BRICK_WIDTH}
        y2={outerHeight + 35}
        stroke="black"
        strokeWidth="2"
      />
      <Line
        x1={outerWidth - BRICK_WIDTH}
        y1={outerHeight + 25}
        x2={outerWidth - BRICK_WIDTH}
        y2={outerHeight + 35}
        stroke="black"
        strokeWidth="2"
      />
      <SvgText
        x={outerWidth / 2}
        y={outerHeight + 45}
        fill="black"
        fontSize="12"
        fontWeight="bold"
        textAnchor="middle"
      >
        Width: {(width / SCALE).toFixed(1)} ft
      </SvgText>

      {/* Right Arrow for Height */}
      <Line
        x1={outerWidth + 10}
        y1={BRICK_HEIGHT}
        x2={outerWidth + 10}
        y2={outerHeight - BRICK_HEIGHT}
        stroke="black"
        strokeWidth="2"
      />
      <Line
        x1={outerWidth + 5}
        y1={BRICK_HEIGHT}
        x2={outerWidth + 15}
        y2={BRICK_HEIGHT}
        stroke="black"
        strokeWidth="2"
      />
      <Line
        x1={outerWidth + 5}
        y1={outerHeight - BRICK_HEIGHT}
        x2={outerWidth + 15}
        y2={outerHeight - BRICK_HEIGHT}
        stroke="black"
        strokeWidth="2"
      />
      <SvgText
        x={outerWidth + 35}
        y={outerHeight / 2}
        fill="black"
        fontSize="12"
        fontWeight="bold"
        textAnchor="middle"
        transform={`rotate(90, ${outerWidth + 35}, ${outerHeight / 2})`}
      >
        Height: {(height / SCALE).toFixed(1)} ft
      </SvgText>
    </Svg>
  );
}

export default BrickBorder;
