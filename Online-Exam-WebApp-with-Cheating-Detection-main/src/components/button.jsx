import React from "react";

function Button({txt,myFucntion}) {
 
  return <button onClick={myFucntion} className="btn">{txt}</button>;
}
export default Button;
