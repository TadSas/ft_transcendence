import React from 'react'
import '../css/Auth.css'
// import logos from "../assets/images/42_Logo.svg"
function Auth()
{
	return (
		<div className="Auth">
			<div className="login">
				<div className="header42">
					<img src="../assets/images/42_Logo.svg" alt="42"/>
				</div>
				<div className="oauthForm">
					<div className="btns">
						<button className="authbtn leftHand">+</button>
						<button className="authbtn btn">Login</button>
					</div>
				</div>
			</div>
			<div className="pong">Pong</div>
		</div>
	)
}

export default Auth;