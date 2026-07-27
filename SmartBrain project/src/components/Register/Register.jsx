// React is imported so this class component can render JSX and manage local form state.
import React from 'react';

// The backend base URL comes from Vite environment variables.
const API_URL = import.meta.env.VITE_API_URL;
    //API_URL -> backend base address
    //import.meta.env -> vite environment system
    //VITE_API_URL -> the backend URL in .env

// Register collects a new user's name, email, and password before calling the backend.
class Register extends React.Component {
    constructor(props) { //The constructor is where we initialize the state of the component. We need to keep track of the email and password input values, so we set them in the state.
        super(props); //This is necessary to properly initialize the component and allow to use 'this' in the constructor.
        // Local state stores the form values BEFORE the user clicks Register.
        this.state = {
            email: '',
            password: '',
            name: ''
        }
    }

    // Updates the name field as the user types.
    onNameChange = (event) => { //runs everytime user types in name field.
        this.setState({name: event.target.value});
        //This is where you would typically handle the input change and update the state accordingly.
        // event -> represents browser event
        //event.target -> the input element
        //event.target.value -> current text 
        //setState -> updates State

    }

    // Updates the email field as the user types.
    onEmailChange = (event) => {
        this.setState({email: event.target.value});
    }

    // Updates the password field as the user types.
    onPasswordChange = (event) => {
        this.setState({password: event.target.value});
    }

    // Sends the registration form to the backend /register route.
    onSubmitSignIn = (event) => { //ths is triggered when user clicks the Register button
        // Here you would typically send a request to your backend to verify the user's credentials.
        event.preventDefault(); // Prevent the default form submission behavior, which would cause a page reload. Without it, page refresh -> state resets -> app breaks
        // The backend Register controller hashes the password and inserts the user into the database.
        fetch(`${API_URL}/register`, {//without the HTTP request, there's no way for frontend to ask backend anything
        //send HTTP request
        //${API_URL} → backend base URL
        ///signin → backend route
            method: 'post', //send data to server. Not GET because the secret data would appear in logs, URLs, browser history
            headers: {'Content-Type': 'application/json'}, //sending JSON data
            body: JSON.stringify({ //converting JS object -> JSON string -> send to backend
                email: this.state.email, //taking email from state
                password: this.state.password, //taking password from state
                name: this.state.name
            })
        })
        .then(response => {//whatever the server responds with, convert it to JSON. This is typically the user object that the server sends back after successful registration.
            if (!response.ok) { //if server fails, 400 -> bad req; 401 -> unauthorized; 500 -> server error
                throw new Error (`Register failed: ${response.status}`); //this is to stop execution and shows error
            }
            
            return response.json(); //converts backend JSON into JS object
        })
        .then(user => { //now frontend receives user object from backend database
            if (user.id) {//if the server responds with a user object that has an id, we consider the registration successful and load the user and route to the home page.
                // loadUser is defined in App.jsx and stores the backend user in top-level state.
                this.props.loadUser(user)
                // After registration succeeds, App.jsx switches to the home route.
                this.props.onRouteChange('home');
            }
        })
    }

    render() {
        return (
            // Tachyons classes create the centered card-style registration form.
            <article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
                <main className="pa4 black-80">
                    <div className="measure">
                        <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                            <legend className="f1 fw6 ph0 mh0">Register</legend>
                            <div className="mt3">
                                {/* Name input connects to local state through onNameChange. */}
                                <label className="db fw6 lh-copy f6" htmlFor="name">Name</label>
                                <input
                                className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                                type="text"
                                name="name"
                                id="name"
                                onChange={this.onNameChange}/>
                            </div>
                            <div className="mt3">
                                {/* Email input connects to local state through onEmailChange. */}
                                <label className="db fw6 lh-copy f6" htmlFor="email-address">Email</label>
                                <input
                                className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                                type="email"
                                name="email-address"
                                id="email-address"
                                onChange={this.onEmailChange}/>
                            </div>
                            <div className="mv3">
                                {/* Password input connects to local state through onPasswordChange. */}
                                <label className="db fw6 lh-copy f6" htmlFor="password">Password</label>
                                <input
                                className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                                type="password"
                                name="password"
                                id="password"
                                onChange={this.onPasswordChange}/>
                            </div>
                        </fieldset>
                        <div className="">
                            {/* Clicking this button runs onSubmitSignIn, which calls the backend. */}
                            <input
                            onClick={this.onSubmitSignIn}
                            className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                            type="submit"
                            value="Register" />
                        </div>
                    </div>
                </main>
            </article>
        );
    };
}

export default Register;
