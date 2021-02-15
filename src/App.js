import React, { Component } from 'react'
import Video from './Video'
import Home from './Home'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

const App = props => {
  return <div>
				<Router>
					<Switch>
						<Route path="/" exact component={Home} />
						<Route path="/:url" component={Video} />
					</Switch>
				</Router>
			</div>;
};

export default App;