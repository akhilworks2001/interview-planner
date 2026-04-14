import React, { useState } from 'react';
import { useNavigate,  Link} from "react-router";
import {useAuth} from "../hooks/useAuth";

function Register() {
  const { loading, handleRegister } = useAuth();
  const navigte = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleRegister(username, email, password);
    navigte('/');

    setUsername("");
    setEmail("");
    setPassword("");
  };

  if (loading) {
    return (
        <main>
            <h1>Loading....</h1>
        </main>
    )
}

  return (
    <main>
        <div className="form-container">
            <h1>Register</h1>

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="username">User Name</label>
                    <input type="text" id="username" name="username" placeholder="Enter username" onChange={(e) => setUsername(e.target.value)} value={username}/>
                </div>

                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="Enter email address" onChange={(e) => setEmail(e.target.value)} value={email}/>
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Enter password" onChange={(e) => setPassword(e.target.value)} value={password}/>
                </div>

                <button className="button primary-button">Register</button>
            </form>

            <p>Already have an account? <Link to={"/login"} >Login</Link></p>
        </div>
    </main>
  )
}

export default Register