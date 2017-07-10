import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import github from './github.js'

function Issue(props) {
   return <tr>
      <td>{props.issue.number}</td>
      <td>{props.issue.title}</td>
      <td>{props.issue.openDate}</td>
      <td><img width="30" height="30" src={props.issue.authorAvatar} alt={props.issue.author}/></td>
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
class Paginator extends React.Component {
   constructor(props){
     super(props)
     this.state = {
       perPage: props.perPageParams[0],
       page: 1,
       maxPage: props.maxPage,
       hasNextPage: props.maxPage > 1
     }
   }
   componentWillReceiveProps(newProps) {
     if (this.props.maxPage !== newProps.maxPage)
      this.setState({maxPage: newProps.maxPage})
   }
   handlePrevPageClick() {
     this.setState(state => ({ page: state.page-1}), () => 
      this.props.onPageChanged && this.props.onPageChanged(this.getOptions()))
   }
   handleNextPageClick() {
     debugger;
     this.setState(state => ({ page: state.page+1}), () =>
     this.props.onPageChanged && this.props.onPageChanged(this.getOptions()))
   }
   handlePerPageClick(count) {
     this.setState({
       page: 1,
       perPage: count
     }, () => { 
       this.props.onPerPageChanged && this.props.onPerPageChanged(this.getOptions())
       this.props.onPageChanged && this.props.onPageChanged(this.getOptions())
     })
   }
   getOptions() {
     return {
       page: this.state.page,
       perPage: this.state.perPage
     }
   }
  render() {
    let prevButton = null, nextButton = null;
    if (this.state.page > 1)
      prevButton = <a href="#" onClick={() => this.handlePrevPageClick()}>&lt;</a>
    if (this.state.page < this.state.maxPage)
      nextButton = <a href="#" onClick={() => this.handleNextPageClick()}>&gt;</a>
    let perPagePanel = this.props.perPageParams.map(p => (<a href="#" key={p} onClick={() => this.handlePerPageClick(p)} className={this.state.perPage === p ? 'selected' : null}>{p} </a>))
    return <div>
      { perPagePanel }
      { this.props.children }
      { prevButton }
      <span>{this.state.page}</span>
      { nextButton }
    </div>
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
         maxPage: 0
      }
   }
   handleUserChange(e) {
      const username = e.target.value
      this.setState({user: username})
      github.retrieveUserRepos(username).then(repos => { 
        repos.unshift('');  
        this.setState({repos: repos}) 
      })
   }
   handleRepoChange(e) {
      const repo = e.target.value;
      if (!repo) {
        this.setState({selectedRepo: repo, issues: []})
        return;
      }
      this.setState({selectedRepo: repo, status: 'Loading...', issues: []}, () => this.retrieveIssues(1, 5))      
   }
   retrieveIssues(page, perPage) {
      github.retrieveIssues(this.state.user, this.state.selectedRepo, page, perPage)
         .then(issues => this.setState({ issues: issues.result, status: '', maxPage: issues.maxPage || page }))
         .catch(errorMessage => this.setState({ status: `Error: ${errorMessage}`}))
   }
   render() {
      let repos = this.state.repos.map(r => <option key={r} value={r}>{r}</option>)
      let issueList = this.state.issues.length > 0 ? 
        (<Paginator perPageParams={[5, 10, 15]} maxPage={this.state.maxPage} onPageChanged={data => this.retrieveIssues(data.page, data.perPage)} onPerPageChanged={data => this.retrieveIssues(data.page, data.perPage)}>
              <IssueList issues={this.state.issues} />
        </Paginator>) : null;
      return <div>
         <input type="text" onChange={e => this.handleUserChange(e)} value={this.state.user} placeholder="username" />
         <select value={this.state.selectedRepo} onChange={e => this.handleRepoChange(e)}>{repos}</select>
         <div>{this.state.status}</div>
         {issueList}
      </div>
   }
}
ReactDOM.render(
  <IssuesApp />,
  document.getElementById('root')
);
