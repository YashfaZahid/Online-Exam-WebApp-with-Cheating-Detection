import React from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"
import Button from "../components/button";
function Login(){

    const navigate=useNavigate()
    const goToTeacherChoice=()=>{
        navigate("/TeacherChoice")
    }
    const goToStudentChoice=()=>{
        navigate("/StudentChoice")
    }
    return(
        <div className="container">
            <div className="box">
                <h1>Proctor Eye</h1>
                <p>Smart. Simple. Secure.</p>
                <h2>Login As a</h2>
                <Button txt={"Teacher"} myFucntion={goToTeacherChoice}/>
                <Button txt={"Student"} myFucntion={goToStudentChoice}/>
            </div>
        </div>

    )
}
export default Login;