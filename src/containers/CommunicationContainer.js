import React, { useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import MediaContainer from './MediaContainer';
import Communication from '../components/Communication';
import store from '../store';
import { connect } from 'react-redux';
const CommunicationContainer = (props) => {
	const [state, setState] = useState({
		sid: '',
		message: '',
		audio: true,
		video: true,
	});
	useEffect(() => {
		const socket = props.socket;
		console.log('props', props);
		setState({ ...state, video: props.video, audio: props.audio });

		socket.on('create', () =>
			props.media.setState({ ...state, user: 'host', bridge: 'create' })
		);
		socket.on('full', full);
		socket.on('bridge', (role) => props.media.init());
		socket.on('join', () =>
			props.media.setState({ user: 'guest', bridge: 'join' })
		);
		socket.on('approve', ({ message, sid }) => {
			props.media.setState({ bridge: 'approve' });
			setState({ ...state, message, sid });
		});
		socket.emit('find');
		props.getUserMedia.then((stream) => {
			localStream = stream;
			localStream.getVideoTracks()[0].enabled = state.video;
			localStream.getAudioTracks()[0].enabled = state.audio;
		});
	}, []);
	const hideAuth = () => {
		props.media.setState({ ...state, bridge: 'connecting' });
	};
	const full = () => {
		props.media.setState({ ...state, bridge: 'full' });
	};

	const handleInput = (e) => {
		setState({ ...state, [e.target.dataset.ref]: e.target.value });
	};
	const send = (e) => {
		e.preventDefault();
		props.socket.emit('auth', state);
		hideAuth();
	};
	const handleInvitation = (e) => {
		e.preventDefault();
		props.socket.emit([e.target.dataset.ref], state.sid);
		hideAuth();
	};
	const toggleVideo = () => {
		const video = (localStream.getVideoTracks()[0].enabled = !state.video);

		setState({ ...state, video });
		props.setVideo(video);
	};
	const toggleAudio = () => {
		const audio = (localStream.getAudioTracks()[0].enabled = !state.audio);
		setState({ ...state, audio });
		props.setAudio(audio);
	};
	const handleHangup = () => {
		props.media.hangup();
	};

	return (
		<Communication
			{...state}
			toggleVideo={toggleVideo}
			toggleAudio={toggleAudio}
			send={send}
			handleHangup={handleHangup}
			handleInput={handleInput}
			handleInvitation={handleInvitation}
		/>
	);
};

const mapStateToProps = (store) => ({ video: store.video, audio: store.audio });
const mapDispatchToProps = (dispatch) => ({
	setVideo: (boo) => store.dispatch({ type: 'SET_VIDEO', video: boo }),
	setAudio: (boo) => store.dispatch({ type: 'SET_AUDIO', audio: boo }),
});

CommunicationContainer.propTypes = {
	socket: PropTypes.object.isRequired,
	getUserMedia: PropTypes.object.isRequired,
	audio: PropTypes.bool.isRequired,
	video: PropTypes.bool.isRequired,
	setVideo: PropTypes.func.isRequired,
	setAudio: PropTypes.func.isRequired,
	media: PropTypes.instanceOf(MediaContainer),
};
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(CommunicationContainer);
