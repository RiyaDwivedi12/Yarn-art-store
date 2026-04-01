import React from "react";

function Rating({ value = 4 }) {

  const stars = [];

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{ color: "#f5a623", fontSize: "18px" }}>
        {i <= value ? "★" : "☆"}
      </span>
    );
  }

  return <div>{stars}</div>;
}

export default Rating;