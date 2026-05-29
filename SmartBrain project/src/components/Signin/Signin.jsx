import React from 'react';

const API_URL = import.meta.env.VITE_API_URL;

//const Signin = ({ onRouteChange }) => {//This is a functional component, but we need to use state to manage the input values, so we'll conver it to a class component.
class Signin extends React.Component {
    constructor(props) {//The constructor is where we initialize the state of the component. We need to keep track of the email and password input values, so we set them in the state.
        super(props);//The super(props) call is necessary to properly initialize the component and allow us to use 'this' in the constructor.
        this.state = {//Here we define the initial state of the component. We have two properties: signInEmail and signInPassword, which will hold the values of the email and password input fields.
            signInEmail: '',
            signInPassword: ''
        }
    }

    onEmailChange = (event) => {
        this.setState({signInEmail: event.target.value});
        //This is where you would typically handle the input change and update the state accordingly. For example, you could set the state with the email and password values as the user types them in.
    }

    onPasswordChange = (event) => {
        this.setState({signInPassword: event.target.value});
        //This is where you would typically handle the input change and update the state accordingly. For example, you could set the state with the email and password values as the user types them in.
    }

    onSubmitSignIn = (event) => {
        //console.log(this.state);
        // Here you would typically send a request to your backend to verify the user's credentials.
        event.preventDefault(); // Prevent the default form submission behavior, which would cause a page reload. This allows us to handle the form submission with JavaScript instead.
        fetch(`${API_URL}/signin`, {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: this.state.signInEmail,
                password: this.state.signInPassword
            })
        })
        //fetch by default makes a GET request, but you would typically want to make a POST request to send the email and password to the server for authentication. You can do this by adding an options object as the second argument to the fetch function
        .then(response => response.json())
        .then(user => {
            console.log('signin response:', user);

            if (user.id) {
                this.props.loadUser(user);
                this.props.onRouteChange('home'); // If the server responds with a user, we load it and route to the home page.
            }
        })
    }

    render() {
        const { onRouteChange } = this.props;
        return (
            <article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
                <main className="pa4 black-80">
                    <form className="measure">
                        <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                            <legend className="f1 fw6 ph0 mh0">Sign In</legend>
                            <div className="mt3">
                                <label className="db fw6 lh-copy f6" htmlFor="email-address">Email</label>
                                <input 
                                className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                                type="email"
                                name="email-address"
                                id="email-address"
                                onChange ={this.onEmailChange}/>
                            </div>
                            <div className="mv3">
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
                            <input
                            onClick={this.onSubmitSignIn}
                            className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                            type="submit"
                            value="Sign in" />
                        </div>
                        <div className="lh-copy mt3">
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
