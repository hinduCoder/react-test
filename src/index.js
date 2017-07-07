import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
let github = require('./github.js')

function Issue(props) {
   return <tr>
      <td>{props.issue.number}</td>
      <td>{props.issue.title}</td>
      <td>{props.issue.openDate}</td>
      <td><img width="30" height="30" src={props.issue.authorAvatar}/></td>
      <td><a href={props.issue.authorLink}>{props.issue.author}</a></td>
   </tr>
}
class IssueList extends React.Component {
   constructor(props) {
      super(props)
      this.state = {
         issues: [],
      }
   }
   render() {
      let issues = this.props.issues.map(issue => 
            <Issue key={issue.number} issue={issue} />
         )
      return (<table><tbody>{issues}</tbody></table>)
   }
}
class IssuesApp extends React.Component {
   constructor(props) {
      super(props)
      this.state = {
         user: "",
         repos: [], 
         selectedRepo: '',
         issues: [],
         status: '',
         page: 1,
         perPage: 5,
         hasNextPage: true
      }
   }
   handleUserChange(e) {
      this.setState({user: e.target.value})
      github.retrieveUserRepos(e.target.value).then(repos => this.setState({repos: repos}))
   }
   handleRepoChange(e) {
      this.setState({selectedRepo: e.target.value, status: 'Loading...', issues: []}, this.retrieveIssues)      
   }
   retrieveIssues() {
      github.retrieveIssues(this.state.user, this.state.selectedRepo, this.state.page, this.state.perPage)
         .then(issues => this.setState({ issues: issues.result, status: '' }))
         .catch(errorMessage => this.setState({ status: `Error: ${errorMessage}`}))
   }
   handlePerPageClick(count) {
     this.setState({
       page: 1,
       perPage: count
     }, this.retrieveIssues)
   }
   handleNextPageClick() {
     this.setState(state => ({ page: state.page+1}), this.retrieveIssues)
   }
   handlePrevPageClick() {
    this.setState(state => ({ page: state.page-1}), this.retrieveIssues)

   }
   render() {
      let repos = this.state.repos.map(r => <option value={r}>{r}</option>)
      return <div>
         <input type="text" onChange={e => this.handleUserChange(e)} value={this.state.user} placeholder="username" />
         <select value={this.state.selectedRepo} onChange={e => this.handleRepoChange(e)}>{repos}</select>
         <div>{this.state.status}</div>

         <a href="#" onClick={() => this.handlePerPageClick(5)}>5 </a>
         <a href="#" onClick={() => this.handlePerPageClick(10)}>10 </a>
         <a href="#" onClick={() => this.handlePerPageClick(15)}>15</a>
         <IssueList issues={this.state.issues}/>
         { this.state.page > 1 ?
            <a href="#" onClick={() => this.handlePrevPageClick()}>&lt;</a> : <span></span>
         }
         <span>{this.state.page}</span>
         {this.state.hasNextPage ?
              <a href="#" onClick={() => this.handleNextPageClick()}>&gt;</a> : <span></span>
         }
      </div>
   }
}
ReactDOM.render(
  <IssuesApp />,
  document.getElementById('root')
);
