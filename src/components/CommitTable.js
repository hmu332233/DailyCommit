import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import CommitActivity from './CommitActivity';
import * as githubApi from '../api/githubApi';
import * as ArrayMath from '../utils/ArrayMath';
import 'date-format-lite';

var dump_event = [{
  type: 'PushEvent',
  date: new Date(),
  repo: {
    name: 'hmu332233/DailyCommitChecker',
    url: ''
  },
  payload: {
  	commits: [{
      message: '[Fix] font not applied',
    	url: ''
    }, {
      message: `Merge branch 'hotfix/0.1.1'`,
    	url: ''
    }],
    ref: 'refs/heads/master'
	}
}];


const propTypes = {
  userName: PropTypes.string
};

const defaultProps = {
  userName: 'hmu332233'
};

class CommitTable extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      commitState: [0,0,0,0,0,0,0],
      commitCount: 0,
      userAvatarUrl: '',
      lastCommitDate: '',
      isCommittedToday: false,
      isShowingActivity: false,
      events: dump_event
    };
    
    this.handleClickTable = this.handleClickTable.bind(this);
    this.parseEventObj = this.parseEventObj.bind(this);
  }
  
  handleClickTable() {
  	this.setState({
      isShowingActivity: !this.state.isShowingActivity
    }); 
  }
  
  parseEventObj(events) {
    // console.log(events);
    const pushEvents = events.filter(function (event) {
      return event.type === 'PushEvent';
    });
    // console.log(pushEvents);
    const newPushEvents = pushEvents.map(function (event) {
      const new_event = {
        type: 'PushEvent',
        date: event.created_at,
        repo: event.repo,
        commits: event.payload.commits,
        branch: event.payload.ref.split('refs/heads/')[1]
      };
 			return new_event;
    });
    
    // console.log('newPushEvents',newPushEvents);
    return newPushEvents;
  }
  
  componentDidMount() {
    
    const currentDate = new Date();
    const dateAWeekAgo = new Date().add(-6, 'days');
    dateAWeekAgo.setHours(0,0,0,0);

    githubApi.getEvents(this.props.userName)
      .then(eventsData => {
      	
      	//현재 날짜로부터 일주일전까지의 event만을 가져온다.
        const events = eventsData.data.filter(function (event) {
        	const eventDate = new Date(event.created_at);
       		return eventDate.getTime() > dateAWeekAgo.getTime();
        });
      	const commitState = [];
      	const commitEventsForAWeek = [];

        for(var i = 0; i < 7; i++) {
          commitState.push(0);
          commitEventsForAWeek.push([]);
        }
      	events.forEach(function (event) {
          const date = new Date(event.created_at);
          const day = date.getDay();
          if (commitState[day]) {
            commitState[day] += 1;
          } else {
            commitState[day] = 1;
          }
          commitEventsForAWeek[day].push(event);
        });
      	console.log(commitEventsForAWeek);
      
        const lastCommitDate = new Date(events[0].created_at);
      	this.setState({
          commitState: commitState,
          commitCount: ArrayMath.sum(commitState),
          userAvatarUrl: events[0].actor.avatar_url,
          lastCommitDate: lastCommitDate.format("MM-DD hh:mm", 9),
          isCommittedToday: lastCommitDate.getDate() === currentDate.getDate(),
          events: events
        });
      }, error => {
      	console.log(error);
    });
  }

  render() {
    const nodeElement = function (active, commitSize, _key) {
      const _className = `node ${active}`;
     	return (
        <div className={_className} key={_key}>{commitSize}</div>
      );
    };
    
    const convertToNode = function (commitState) {
      return commitState.map(function (state, i) {
        if (state && state > 0) {
          return nodeElement('active', state, i);
        } else {
          return nodeElement('', state,i);
        }
      });
    };
    
    return (
      <div className="commit-table" onClick={this.handleClickTable}>
        <div className="row bg-white card-bg">
          <div className="left-col col-lg-6 mb-2 mb-lg-0 d-flex align-items-center justify-content-between">
            <div className="commit-table__user-profile d-flex align-items-center">
              <div className="commit-table__user-image-wrapper"><img src={this.state.userAvatarUrl} alt="img" className="img-fluid"/></div>
              <div className="commit-table__user-id">
                <h6>{this.props.userName}</h6>
              </div>
            </div>
            <div className="commit-table__check">Today Commit: <span>{this.state.isCommittedToday ? 'O' : 'X'}</span></div>
          </div>
          <div className="right-col col-lg-6 d-flex align-items-center">
            <div className="commit-table__date">{this.state.lastCommitDate}</div>
            <div className="commit-table__count">count: <span>{this.state.commitCount}</span></div>
            <div className="commit-table__commits ml-auto">
              {convertToNode(this.state.commitState)}
            </div>
          </div>
        </div>
				{this.state.isShowingActivity && <CommitActivity events={this.parseEventObj(this.state.events)} />}
      </div>
    );
  }
}

CommitTable.propTypes = propTypes;
CommitTable.defaultProps = defaultProps;

// const mapStateToProps = function (state) {
//   return {
//     number: state.counter.number,
//     color: state.ui.color
//   };
// }

// const mapDispatchToProps = (dispatch) => {
//   return {
//     handleIncrement: () => { dispatch(actions.increment()) },
//     handleDecrement: () => { dispatch(actions.decrement()) },
//     handleSetColor: (color) => { dispatch(actions.setColor(color)) }
//   };
// }

export default CommitTable;