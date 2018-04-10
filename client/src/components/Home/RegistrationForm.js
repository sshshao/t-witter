import React from 'react'
import { Field, reduxForm } from 'redux-form'

const FORM_NAME = 'user_registration';

var RegistrationForm = (props) => {
    //const { handleSubmit } = props;
    return (
        <form onSubmit={props.handleSubmit}>
            <div>
                <label htmlFor="username">Username</label>
                <Field name="username" component="input" type="text" />
            </div>
            <div>
                <label htmlFor="email">Email</label>
                <Field name="email" component="input" type="email" />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <Field name="password" component="input" type="password" />
            </div>
            <button type="submit">Submit</button>
        </form>);
}

export default reduxForm({form: FORM_NAME})(RegistrationForm);