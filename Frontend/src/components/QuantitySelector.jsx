import React, { useState } from "react";

function QuantitySelector({ onChange, initial = 1 }) {

  const [qty, setQty] = useState(initial);

  const increase = () => {
    const newQty = qty + 1;
    setQty(newQty);
    onChange && onChange(newQty);
  };

  const decrease = () => {
    if (qty > 1) {
      const newQty = qty - 1;
      setQty(newQty);
      onChange && onChange(newQty);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        alignItems: "center",
        margin: "15px 0"
      }}
    >
      <button
        onClick={decrease}
        style={{
          padding: "6px 12px",
          cursor: "pointer"
        }}
      >
        -
      </button>

      <span style={{ fontSize: "18px", fontWeight: "bold" }}>
        {qty}
      </span>

      <button
        onClick={increase}
        style={{
          padding: "6px 12px",
          cursor: "pointer"
        }}
      >
        +
      </button>
    </div>
  );
}

export default QuantitySelector;