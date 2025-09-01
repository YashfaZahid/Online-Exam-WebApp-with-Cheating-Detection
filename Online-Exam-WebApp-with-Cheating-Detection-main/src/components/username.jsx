import React from "react";
import "./input-field.css"
function UsernameField({onChange}){
    return(
        <div>
            <h3>Username</h3>
            <input onChange={(e)=>onChange(e.target.value)} type="text" placeholder="for e.g. yashfa_zahid" className="input-box"/>
        </div>
    )
}
export default UsernameField;