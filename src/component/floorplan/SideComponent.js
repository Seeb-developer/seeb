import React from 'react';
import Svg, { Text as SvgText } from 'react-native-svg';

const BRICK_WIDTH = 15;
const BRICK_HEIGHT = 15;
const LABEL_OFFSET = 30; // distance outside the border

const SideComponent = ({ width, height }) => {
  const outerWidth = width + BRICK_WIDTH * 2;
  const outerHeight = height + BRICK_HEIGHT * 2;

  const svgWidth = outerWidth + LABEL_OFFSET * 2;
  const svgHeight = outerHeight + LABEL_OFFSET * 2;

  return (
    <Svg
      width={svgWidth}
      height={svgHeight}
      style={{
        position: 'absolute',
        top: -LABEL_OFFSET,
        left: -LABEL_OFFSET,
        pointerEvents: 'none',
      }}
    >
      {/* Top (A) */}
      <SvgText
        x={svgWidth / 2}
        y={LABEL_OFFSET - 10}
        fill="#FACC15"
        fontSize="25"
        fontWeight="bold"
        textAnchor="middle"
      >
        C
      </SvgText>

      {/* Right (B) */}
      <SvgText
        x={svgWidth - 5}
        y={svgHeight / 2}
        fill="#FACC15"
        fontSize="25"
        fontWeight="bold"
        textAnchor="middle"
        // transform={`rotate(90, ${svgWidth - 5}, ${svgHeight / 2})`}
      >
        B
      </SvgText>

      {/* Bottom (C) */}
      <SvgText
        x={svgWidth / 2}
        y={svgHeight - 5}
        fill="#FACC15"
        fontSize="25"
        fontWeight="bold"
        textAnchor="middle"
      >
        D
      </SvgText>

      {/* Left (D) */}
      <SvgText
        x={8}
        y={svgHeight / 2}
        fill="#FACC15"
        fontSize="25"
        fontWeight="bold"
        textAnchor="middle"
        // transform={`rotate(90, 5, ${svgHeight / 2})`}
      >
        A
      </SvgText>
    </Svg>
  );
};

export default SideComponent;
