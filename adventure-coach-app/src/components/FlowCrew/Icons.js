import React from 'react';
import { Svg, Path, G, Circle } from 'react-native-svg';
import { Colors } from '../../styles/FlowCrewDesignSystem';

/**
 * FlowCrew Icon Library
 *
 * A collection of SVG icons used throughout the FlowCrew design system
 * All icons are designed to be used at 24x24 pixels by default
 */

// Activity types
export const BikeIcon = ({ size = 24, color = Colors.text.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5.5 19C7.98528 19 10 16.9853 10 14.5C10 12.0147 7.98528 10 5.5 10C3.01472 10 1 12.0147 1 14.5C1 16.9853 3.01472 19 5.5 19Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 19C20.9853 19 23 16.9853 23 14.5C23 12.0147 20.9853 10 18.5 10C16.0147 10 14 12.0147 14 14.5C14 16.9853 16.0147 19 18.5 19Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 6.5L16.5 9L14 14.5L8.5 12L5.5 14.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 14.5V17.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 6.5C14.8284 6.5 15.5 5.82843 15.5 5C15.5 4.17157 14.8284 3.5 14 3.5C13.1716 3.5 12.5 4.17157 12.5 5C12.5 5.82843 13.1716 6.5 14 6.5Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HikeIcon = ({ size = 24, color = Colors.text.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 10L7 22M9 10L12.5 7.5L13.5 3.5M9 10L13 15L15 22M13.5 3.5C14.3284 3.5 15 2.82843 15 2C15 1.17157 14.3284 0.5 13.5 0.5C12.6716 0.5 12 1.17157 12 2C12 2.82843 12.6716 3.5 13.5 3.5Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19 22C20.6569 22 22 20.6569 22 19C22 17.3431 20.6569 16 19 16C17.3431 16 16 17.3431 16 19C16 20.6569 17.3431 22 19 22Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 22C4.65685 22 6 20.6569 6 19C6 17.3431 4.65685 16 3 16C1.34315 16 0 17.3431 0 19C0 20.6569 1.34315 22 3 22Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ClimbIcon = ({ size = 24, color = Colors.text.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 3L21 8M8 16L3 21M8 3L3 8M16 16L21 21"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 8.5V15.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15.5 12H8.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const WaterIcon = ({ size = 24, color = Colors.text.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9C3 11.3869 3.94821 13.6761 5.63604 15.364C7.32387 17.0518 9.61305 18 12 18C14.3869 18 16.6761 17.0518 18.364 15.364C20.0518 13.6761 21 11.3869 21 9L12 3L3 9Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 18L4.5 16.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 18L19.5 16.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Navigation icons
export const HomeIcon = ({ size = 24, color = Colors.text.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9.5L12 2L21 9.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9.5Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 22V12H15V22"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MapIcon = ({ size = 24, color = Colors.text.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 6V22L8 18L16 22L23 18V2L16 6L8 2L1 6Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 2V18"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 6V22"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BookingIcon = ({ size = 24, color = Colors.text.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 2V6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 2V6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 10H21"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MessageIcon = ({ size = 24, color = Colors.text.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ProfileIcon = ({ size = 24, color = Colors.text.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// UI icons
export const SearchIcon = ({ size = 24, color = Colors.text.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 21L16.65 16.65"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ArrowLeftIcon = ({ size = 24, color = Colors.text.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 19L5 12L12 5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const StarIcon = ({ size = 24, color = Colors.text.primary, filled = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? color : 'none'}
    />
  </Svg>
);

// FlowCrew Logo
// NOTE: this is a DIFFERENT implementation from components/FlowCrew/FlowCrewLogo.js
// (which now renders the real logo asset you uploaded). This one is a vector
// approximation (four overlapping gradient-stroked circles) built before the
// real logo existed. MessagesScreen.js imports FlowCrewLogo from THIS file,
// not from FlowCrewLogo.js - so as-authored, that screen shows the vector
// approximation, not your real logo. Preserved as-is rather than silently
// merged; needs an explicit decision on which one screens should use.
export const FlowCrewLogo = ({ size = 40 }) => {
  const width = size * 2.5; // Aspect ratio for the logo
  const height = size;

  return (
    <Svg width={width} height={height} viewBox="0 0 250 100" fill="none">
      <G>
        <Path
          d="M50 30C61.046 30 70 39.0544 70 50C70 60.9456 61.046 70 50 70C38.954 70 30 60.9456 30 50C30 39.0544 38.954 30 50 30Z"
          fill="none"
          stroke="url(#paint0_linear)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <Path
          d="M90 30C101.046 30 110 39.0544 110 50C110 60.9456 101.046 70 90 70C78.954 70 70 60.9456 70 50C70 39.0544 78.954 30 90 30Z"
          fill="none"
          stroke="url(#paint0_linear)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="0 1 2 3"
        />
        <Path
          d="M120 50C120 33.4315 133.432 20 150 20V20C166.569 20 180 33.4315 180 50V50C180 66.5685 166.569 80 150 80V80C133.432 80 120 66.5685 120 50V50Z"
          fill="none"
          stroke="url(#paint1_linear)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <Path
          d="M180 50C180 33.4315 193.431 20 210 20V20C226.569 20 240 33.4315 240 50V50C240 66.5685 226.569 80 210 80V80C193.431 80 180 66.5685 180 50V50Z"
          fill="none"
          stroke="url(#paint1_linear)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="0 1 2 3"
        />
      </G>
      <defs>
        <linearGradient id="paint0_linear" x1="30" y1="50" x2="110" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7ED321" />
          <stop offset="1" stopColor="#00D4AA" />
        </linearGradient>
        <linearGradient id="paint1_linear" x1="120" y1="50" x2="240" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00D4AA" />
          <stop offset="1" stopColor="#2196F3" />
        </linearGradient>
      </defs>
    </Svg>
  );
};

// Export all icons in a single object
export const Icons = {
  BikeIcon,
  HikeIcon,
  ClimbIcon,
  WaterIcon,
  HomeIcon,
  MapIcon,
  BookingIcon,
  MessageIcon,
  ProfileIcon,
  SearchIcon,
  ArrowLeftIcon,
  StarIcon,
  FlowCrewLogo
};
