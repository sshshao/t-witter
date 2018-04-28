import React, { Component } from 'react';
import { connect } from 'react-redux';

import './Timeline.css';


const mapStateToProps = (store) => {
  return {
    timeline: store.feed.timeline
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    //onIncreaseClick: () => dispatch(increment()),
  }
}

class Timeline extends Component {
  render() {
    return (
      <div className="Timeline">

        <ul class="tags">
          {this.props.feed.map((d, i) => 
            <li id={i}>
                <p>@{d.username}: {d.content}</p>
            </li>)}
        </ul>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Timeline);