import React from "react";
import Svg, { Path, G, ClipPath, Defs, Rect } from "react-native-svg";

export function BackArrowIcon({
  width = 24,
  height = 24,
  color = "white",
  opacity = 0.7,
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11.9948 18.9918L4.9978 11.9948L11.9948 4.99783"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth="1.99913"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.9917 11.9948H4.9978"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth="1.99913"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EditIcon({
  width = 16,
  height = 16,
  color = "#FDC700",
  opacity = 1,
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Defs>
        <ClipPath id="clip0_28_2722">
          <Rect width="15.9931" height="15.9931" fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0_28_2722)">
        <Path
          d="M14.1098 4.53938C14.4622 4.18715 14.6601 3.70939 14.6602 3.21119C14.6602 2.713 14.4624 2.23519 14.1102 1.88287C13.7579 1.53055 13.2802 1.33258 12.782 1.33252C12.2838 1.33246 11.806 1.5303 11.4537 1.88253L2.56019 10.778C2.40547 10.9323 2.29105 11.1222 2.227 11.3311L1.34671 14.2312C1.32949 14.2888 1.32819 14.35 1.34295 14.4083C1.35771 14.4666 1.38798 14.5199 1.43054 14.5624C1.47311 14.6049 1.52638 14.635 1.58472 14.6497C1.64305 14.6644 1.70426 14.663 1.76187 14.6457L4.66261 13.766C4.8713 13.7026 5.06122 13.5888 5.2157 13.4349L14.1098 4.53938Z"
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth="1.33275"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

export function RemoveIcon({
  width = 20,
  height = 20,
  color = "white",
  opacity = 1,
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 6L18 18"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
