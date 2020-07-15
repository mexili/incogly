import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import store from './store';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Home from './containers/HomePage'
import Room from './containers/RoomPage'
import HeroPage from './containers/HeroPage/HeroPage'
import NotFound from './components/NotFound'
import 'bootstrap/dist/css/bootstrap.min.css';

import styles from './app.css'

render(
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
        <Route exact path="/" component={HeroPage} />
				<Route exact path="/colab" component={Home} />
				<Route path="/colab/r/:room" component={Room} />
				<Route path="*" component={NotFound} />
			</Switch>
		</BrowserRouter>
	</Provider>,
	document.getElementById('app')
);
