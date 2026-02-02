import React from "react";
import Svg, { Path } from "react-native-svg";

function Logo({ width = 120, height = 120 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 96 96" fill="none">
      <Path
        d="M0 47.9994C0 21.4901 21.4901 0 47.9994 0C74.5087 0 95.9988 21.4901 95.9988 47.9994C95.9988 74.5087 74.5087 95.9988 47.9994 95.9988C21.4901 95.9988 0 74.5087 0 47.9994Z"
        fill="#009966"
      />
      <Path
        d="M47.9994 71.331C60.8851 71.331 71.3311 60.8851 71.3311 47.9994C71.3311 35.1137 60.8851 24.6678 47.9994 24.6678C35.1137 24.6678 24.6678 35.1137 24.6678 47.9994C24.6678 60.8851 35.1137 71.331 47.9994 71.331Z"
        stroke="white"
        strokeWidth="4.66633"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M47.9994 61.9984C55.7308 61.9984 61.9984 55.7308 61.9984 47.9994C61.9984 40.268 55.7308 34.0004 47.9994 34.0004C40.268 34.0004 34.0004 40.268 34.0004 47.9994C34.0004 55.7308 40.268 61.9984 47.9994 61.9984Z"
        stroke="white"
        strokeWidth="4.66633"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M47.9995 52.6657C50.5766 52.6657 52.6658 50.5765 52.6658 47.9994C52.6658 45.4223 50.5766 43.3331 47.9995 43.3331C45.4223 43.3331 43.3331 45.4223 43.3331 47.9994C43.3331 50.5765 45.4223 52.6657 47.9995 52.6657Z"
        stroke="white"
        strokeWidth="4.66633"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default Logo;
