// React is imported so this class component can render JSX and manage local form state.
import React from 'react';

// The backend base URL comes from Vite environment variables.
// Vite injects this base URL from the VITE_API_URL environment variable.
const API_URL = import.meta.env.VITE_API_URL;
    //API_URL -> backend base address
    //import.meta.env -> vite environment system
    //VITE_API_URL -> the backend URL in .env

class Signin extends React.Component { //meaning that Signin is a React Component that inherits React features
    constructor(props) {//The constructor is where we initialize the state of the component. We need to keep track of the email and password input values, so we set them in the state.
        super(props);//This is necessary to properly initialize the component and allow to use 'this' in the constructor.
        this.state = {//Defining the initial state update, this is what user is typing BEFORE sending it to backend.
            signInEmail: '',
            signInPassword: ''
        }
    }

    onEmailChange = (event) => { //Stores the email value locally until the user submits the sign-in form.
        // event -> browser event object
        this.setState({signInEmail: event.target.value});
        //This is where you would typically handle the input change and update the state accordingly. For example, you could set the state with the email and password values as the user types them in.
        // event -> represents browser event
        //event.target -> input box
        //event.target.value -> typed text
        //setState -> updates state
    }

    onPasswordChange = (event) => {
        // Stores the password value locally until the user submits the sign-in form.
        this.setState({signInPassword: event.target.value});
        //This is where you would typically handle the input change and update the state accordingly. For example, you could set the state with the email and password values as the user types them in.
    }

    onSubmitSignIn = (event) => { //triggered when user clicks "Sign in"
        // Here you would typically send a request to your backend to verify the user's credentials.
        event.preventDefault(); // Prevent the default form submission behavior, which would cause a page reload. Without it, page refresh -> state resets -> app breaks
        // The backend Signin controller checks the email/password against the database.
        fetch(`${API_URL}/signin`, {//without the HTTP request, there's no way for frontend to ask backend anything
        //send HTTP request
        //${API_URL} → backend base URL
        ///signin → backend route
            method: 'post', //send data to server. Not GET because the secret data would appear in logs, URLs, browser history
            headers: {'Content-Type': 'application/json'}, //sending JSON data
            body: JSON.stringify({ //converting JS object -> JSON string -> send to backend
                email: this.state.signInEmail, //taking email from state
                password: this.state.signInPassword //taking password from state
            })
        })
        //fetch by default makes a GET request, but you would typically want to make a POST request to send the email and password to the server for authentication. You can do this by adding an options object as the second argument to the fetch function
        
        .then(response => { //response check
            if (!response.ok) { //if server fails, 400 -> bad req; 401 -> unauthorized; 500 -> server error
                throw new Error (`Sign in failed: ${response.status}`); //this is to stop execution and shows error
            }
            
            return response.json(); //otherwise backend sends id, name, emaill, entries from JSON format to JS object
        })
        .then(user => { //now frontend receives user object from backend database
            console.log('signin response:', user); // this is to show response in browser console

            if (user.id) {//check user.id when login is successful
                // loadUser is defined in App.jsx and stores the returned database user.
                this.props.loadUser(user); //sending user data to App.jsx through loadUser
                this.props.onRouteChange('home'); // If the server responds with a user, load it and route to the home page through onRouteChange
            }
        })
    }

    render() {
        const { onRouteChange } = this.props; // onRouteChange passes as prop so that Signin.jsx can call it
        return (
            // Tachyons classes create sign-in form, this builds UI
            <article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
                <main className="pa4 black-80">
                    <form className="measure">
                        <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                            <legend className="f1 fw6 ph0 mh0">Sign In</legend>
                            <div className="mt3">
                                {/* Email input updates local signInEmail state. */}
                                <label className="db fw6 lh-copy f6" htmlFor="email-address">Email</label>
                                <input 
                                className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                                type="email"
                                name="email-address"
                                id="email-address"
                                onChange ={this.onEmailChange}/>
                            </div>
                            <div className="mv3">
                                {/* Password input updates local signInPassword state. */}
                                <label className="db fw6 lh-copy f6" htmlFor="password">Password</label>
                                <input
                                className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
                                type="password" 
                                name="password"  
                                id="password"
                                onChange ={this.onPasswordChange}/>
                            </div>
                            {/*<label className="pa0 ma0 lh-copy f6 pointer"><input type="checkbox"/> Remember me</label>*/}
                        </fieldset>
                        <div className="">
                            {/* Clicking this button sends the credentials to the backend. */}
                            <input
                            onClick={this.onSubmitSignIn}
                            className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                            type="submit"
                            value="Sign in" />
                        </div>
                        <div className="lh-copy mt3">
                            {/* This does not call the backend; it only changes App.jsx route state. */}
                            <p onClick={() => onRouteChange('register')} className="f6 link dim black db pointer">Register</p>
                            {/* <a href="#0" className="f6 link dim black db">Forgot your password?</a> */}
                        </div>
                    </form>
                </main>
            </article>
        );
    };
};

export default Signin;
