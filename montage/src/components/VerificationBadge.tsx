import React from 'react';

// Use this URL for your verification badge image
const BADGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Twitter_Verified_Badge.svg/2048px-Twitter_Verified_Badge.svg.png";

type Props = {
  size?: number;
};

const VerificationBadge: React.FC<Props> = ({ size = 32 }) => (
  <img
    src={BADGE_URL}
    alt="Verified"
    style={{
      width: size,
      height: size,
      verticalAlign: 'middle',
      marginLeft: 4,
    }}
  />
);

export default VerificationBadge;
