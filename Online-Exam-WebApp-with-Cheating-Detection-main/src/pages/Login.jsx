import React from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"
import Button from "../components/button";
function Login(){

    const navigate=useNavigate()
    const goToTeacher=()=>{
        navigate("/TeacherLogin")
    }
    const goToStudent=()=>{
        navigate("/StudentLogin")
    }
    return(
        <div className="container">
            <div className="box">
                <h1>Proctor Eye</h1>
                <p>Smart. Simple. Secure.</p>
                <h2>Login As a</h2>
                <Button txt={"Teacher"} myFucntion={goToTeacher}/>
                <Button txt={"Student"} myFucntion={goToStudent}/>
            </div>
        </div>

    )
}
export default Login;