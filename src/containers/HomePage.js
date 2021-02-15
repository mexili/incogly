import React, { useState } from 'react';
import { PropTypes } from 'prop-types';
import Home from '../components/Home';

const HomePage = (props) => {
	const [state, setState] = useState({ roomId: defaultRoomId });
	const defaultRoomId = String(new Date() - new Date().setHours(0, 0, 0, 0));
	const handleChange = (e) => {
		setState({ roomId: e.target.value });
	};

	return (
		<Home
			defaultRoomId={defaultRoomId}
			roomId={state.roomId}
			handleChange={(e) => handleChange(e)}
		/>
	);
};

HomePage.contextTypes = {
	router: PropTypes.object,
};

export default HomePage;
