import React from "react";
import "./input-field.css"
function PasswordField({onChange}){
    return(
        <div>
            <h3>Password</h3>
            <input onChange={(e)=>onChange(e.target.value)} type="password" className="input-box"/>
        </div>
    )
}
export default PasswordField;