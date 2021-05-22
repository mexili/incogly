import * as React from "react";
import Video from "./Video";
import Home from "./Home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

const App = (props) => {
	return (
		<>
			<ChakraProvider>
				<Router>
					<Switch>
						<Route path="/" exact component={Home} />
						<Route path="/:url" component={Video} />
					</Switch>
				</Router>
			</ChakraProvider>
		</>
	);
};

export default App;