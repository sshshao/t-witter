import React from 'react'
import { Field, reduxForm } from 'redux-form'

const FORM_NAME = 'user_login';

var LoginForm = (props) => {
    //const { handleSubmit } = props;
    return (
        <form onSubmit={props.handleSubmit}>
            <div>
                <label htmlFor="username">Username</label>
                <Field name="username" component="input" type="text" />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <Field name="password" component="input" type="password" />
            </div>
            <button type="submit">Submit</button>
        </form>);
}

export default reduxForm({form: FORM_NAME})(LoginForm);