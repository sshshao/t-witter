import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { login, register } from '../../actions/userActions';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';
import './Home.css';


const mapStateToProps = (store) => {
  return {
    username: store.user.username
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onLoginSubmit: (values) => dispatch(login(values)),
    onRegistrationSubmit: (values) => dispatch(register(values))
  }
}

class Home extends Component {  
  render() {
    if(this.props.username != null) {
      return <Redirect to='/timeline' />;
    }

    return (
      <div className="Home">
        <p>Sign in</p>
        <LoginForm onSubmit={this.props.onLoginSubmit} />
        <br /><br />
        <p>Sign up</p>
        <RegistrationForm onSubmit={this.props.onRegistrationSubmit} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);