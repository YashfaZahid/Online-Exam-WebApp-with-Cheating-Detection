import React from "react";
import "./input-field.css";
function EmailField({ onChange }) {
  return (
    <div>
      <h3>Email</h3>
      <input
        onChange={(e) => onChange(e.target.value)}
        type="email"
        placeholder="Enter your email"
        className="input-box"
      />
    </div>
  );
}
export default EmailField;
