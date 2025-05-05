import React from 'react';
import './StarRating.css';

export default function StarRating ({
  rating,
  setRating = null,
  editable = false,
  className = '',
}) {
  const [hovered, setHovered] = React.useState(0);

  const handleMouseEnter = (index) => {
    if (editable) setHovered(index);
  };

  const handleMouseLeave = () => {
    if (editable) setHovered(0);
  };

  const handleClick = (index) => {
    if (editable && setRating) setRating(index);
  };

  return (
    <div className={`star-rating mb-1`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`star ${(hovered || rating) >= i ? 'filled' : ''}  ${className}`}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(i)}
          style={{ cursor: editable ? 'pointer' : 'default' }}
        >
          ★
        </span>
      ))}
    </div>
  );
};
