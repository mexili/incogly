import React, { useCallback, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import io from "socket.io-client";
import faker from "faker";

import { IconButton, Badge, Input } from "@material-ui/core";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";
import StopScreenShareIcon from "@material-ui/icons/StopScreenShare";
import CallEndIcon from "@material-ui/icons/CallEnd";
import ChatIcon from "@material-ui/icons/Chat";
import { Center, VStack, Button } from "@chakra-ui/react";

import { message } from "antd";
import "antd/dist/antd.css";

import { Row } from "reactstrap";
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.css";
import "./Video.scss";
import { isChrome, changeCssVideos } from "../../utils";

const server_url =
	process.env.NODE_ENV === "production" ? "" : "http://localhost:5000";

const peerConnectionConfig = {
	iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
let socket = null;
let socketId = null;
let elms = 0;

const Video = () => {
	const localVideoref = useRef(null);
	const [videoAvailable, setVideoAvailable] = useState(true);
	const [audioAvailable, setAudioAvailable] = useState(true);
	const history = useHistory();
	const { pathname, origin } = window.location;

	const [state, setState] = useState({
		video: false,
		audio: false,
		screen: false,
		showModal: false,
		screenAvailable: false,
		messages: [],
		message: "",
		newmessages: 0,
		askForUsername: true,
		username: faker.internet.userName(),
	});

	let connections = {};

	const getPermissions = useCallback(async () => {
		try {
			const videoValidation = await navigator.mediaDevices.getUserMedia({
				video: true,
			});
			if (videoValidation.active) setVideoAvailable(true);
			else setVideoAvailable(false);

			const audioValidation = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});
			if (audioValidation.active) setAudioAvailable(true);
			else setAudioAvailable(false);

			if (navigator.mediaDevices.getDisplayMedia) {
				setState({ ...state, screenAvailable: true });
			} else {
				setState({ ...state, screenAvailable: false });
			}

			if (videoAvailable || audioAvailable) {
				navigator.mediaDevices
					.getUserMedia({
						video: videoAvailable,
						audio: audioAvailable,
					})
					.then((stream) => {
						window.localStream = stream;
						localVideoref.current.srcObject = stream;
					})
					.then((stream) => {})
					.catch((e) => console.log(e));
			}
		} catch (e) {
			console.log(e);
		}
		// eslint-disable-next-line
	}, [videoAvailable, audioAvailable]);

	useEffect(() => {
		getPermissions();
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		getUserMedia();
		if (!state.video && localVideoref.current.srcObject) {
			try {
				let tracks = localVideoref.current.srcObject.getTracks();
				tracks.forEach((track) => track.stop());
			} catch (e) {
				console.log(e);
			}

			let blackSilence = (...args) =>
				new MediaStream([black(...args), silence()]);
			window.localStream = blackSilence();
			localVideoref.current.srcObject = window.localStream;

			for (let id in connections) {
				connections[id].addStream(window.localStream);
				connections[id]
					.createOffer()
					// eslint-disable-next-line
					.then((description) => {
						connections[id]
							.setLocalDescription(description)
							.then(() => {
								socket.emit(
									"signal",
									id,
									JSON.stringify({
										sdp: connections[id].localDescription,
									})
								);
							})
							.catch((e) => console.log(e));
					});
			}
		}
		// eslint-disable-next-line
	}, [state.video, localVideoref]);

	useEffect(() => {
		getUserMedia();
		if (!state.audio && localVideoref.current.srcObject) {
			try {
				let tracks = localVideoref.current.srcObject.getTracks();
				tracks.forEach((track) => track.stop());
			} catch (e) {
				console.log(e);
			}

			let blackSilence = (...args) =>
				new MediaStream([black(...args), silence()]);
			window.localStream = blackSilence();
			localVideoref.current.srcObject = window.localStream;

			for (let id in connections) {
				connections[id].addStream(window.localStream);
				connections[id]
					.createOffer()
					// eslint-disable-next-line
					.then((description) => {
						connections[id]
							.setLocalDescription(description)
							.then(() => {
								socket.emit(
									"signal",
									id,
									JSON.stringify({
										sdp: connections[id].localDescription,
									})
								);
							})
							.catch((e) => console.log(e));
					});
			}
		}
		// eslint-disable-next-line
	}, [state.audio, localVideoref]);

	useEffect(() => {
		getDislayMedia();
		if (!state.screen && localVideoref.current.srcObject) {
			try {
				let tracks = localVideoref.current.srcObject.getTracks();
				tracks.forEach((track) => track.stop());
			} catch (e) {
				console.log(e);
			}

			let blackSilence = (...args) =>
				new MediaStream([black(...args), silence()]);
			window.localStream = blackSilence();
			localVideoref.current.srcObject = window.localStream;

			getUserMedia();
		}
		// eslint-disable-next-line
	}, [state.screen]);

	const getMedia = useCallback(() => {
		setState({
			...state,
			video: videoAvailable,
			audio: audioAvailable,
		});
	}, [state, videoAvailable, audioAvailable]);

	const getUserMedia = useCallback(() => {
		if (
			(state.video && videoAvailable) ||
			(state.audio && audioAvailable)
		) {
			navigator.mediaDevices
				.getUserMedia({
					video: state.video,
					audio: state.audio,
				})
				.then(getUserMediaSuccess)
				.then((stream) => {})
				.catch((e) => console.log(e));
		} else {
			try {
				let tracks = localVideoref.current.srcObject.getTracks();
				tracks.forEach((track) => track.stop());
			} catch (e) {}
		}
		// eslint-disable-next-line
	}, [state.video, state.audio, videoAvailable, audioAvailable]);

	const getUserMediaSuccess = (stream) => {
		try {
			window.localStream.getTracks().forEach((track) => track.stop());
		} catch (e) {
			console.log(e);
		}

		window.localStream = stream;
		localVideoref.current.srcObject = stream;

		for (let id in connections) {
			if (id === socketId) continue;

			connections[id].addStream(window.localStream);
			// eslint-disable-next-line
			connections[id].createOffer().then((description) => {
				connections[id]
					.setLocalDescription(description)
					.then(() => {
						socket.emit(
							"signal",
							id,
							JSON.stringify({
								sdp: connections[id].localDescription,
							})
						);
					})
					.catch((e) => console.log(e));
			});
		}

		stream.getTracks().forEach(
			(track) =>
				(track.onended = () => {
					setState({
						...state,
						video: false,
						audio: false,
					});
				})
		);
	};

	const getDislayMedia = () => {
		if (state.screen) {
			if (navigator.mediaDevices.getDisplayMedia) {
				navigator.mediaDevices
					.getDisplayMedia({ video: true, audio: true })
					.then(getDislayMediaSuccess)
					.then((stream) => {})
					.catch((e) => console.log(e));
			}
		}
	};

	const getDislayMediaSuccess = (stream) => {
		try {
			window.localStream.getTracks().forEach((track) => track.stop());
		} catch (e) {
			console.log(e);
		}
		window.localStream = stream;
		localVideoref.current.srcObject = stream;

		for (let id in connections) {
			if (id === socketId) continue;

			connections[id].addStream(window.localStream);

			// eslint-disable-next-line
			connections[id].createOffer().then((description) => {
				connections[id]
					.setLocalDescription(description)
					.then(() => {
						socket.emit(
							"signal",
							id,
							JSON.stringify({
								sdp: connections[id].localDescription,
							})
						);
					})
					.catch((e) => console.log(e));
			});
		}

		stream.getTracks().forEach(
			(track) =>
				(track.onended = () => {
					setState({
						...state,
						screen: false,
					});
				})
		);
	};

	const gotMessageFromServer = (fromId, message) => {
		let signal = JSON.parse(message);

		if (fromId !== socketId) {
			if (signal.sdp) {
				connections[fromId]
					.setRemoteDescription(new RTCSessionDescription(signal.sdp))
					.then(() => {
						if (signal.sdp.type === "offer") {
							connections[fromId]
								.createAnswer()
								.then((description) => {
									connections[fromId]
										.setLocalDescription(description)
										.then(() => {
											socket.emit(
												"signal",
												fromId,
												JSON.stringify({
													sdp: connections[fromId]
														.localDescription,
												})
											);
										})
										.catch((e) => console.log(e));
								})
								.catch((e) => console.log(e));
						}
					})
					.catch((e) => console.log(e));
			}

			if (signal.ice) {
				connections[fromId]
					.addIceCandidate(new RTCIceCandidate(signal.ice))
					.catch((e) => console.log(e));
			}
		}
	};

	useEffect(() => {
		connectToSocketServer();
		// eslint-disable-next-line
	}, []);

	const connectToSocketServer = () => {
		socket = io.connect(server_url, {
			secure: true,
			path: "/api/v1/conference/join",
		});

		socket.on("signal", gotMessageFromServer);

		socket.on("connect", () => {
			socket.emit("join-call", origin + pathname);
			socketId = socket.id;

			socket.on("chat-message", addMessage);

			socket.on("user-left", (id) => {
				let video = document.querySelector(`[data-socket="${id}"]`);
				if (video !== null) {
					elms--;
					video.parentNode.removeChild(video);

					let main = document.getElementById("main");
					changeCssVideos(main, elms);
				}
			});

			socket.on("user-joined", (id, clients) => {
				clients.forEach((socketListId) => {
					connections[socketListId] = new RTCPeerConnection(
						peerConnectionConfig
					);
					// Wait for their ice candidate
					connections[socketListId].onicecandidate = function (
						event
					) {
						if (event.candidate != null) {
							socket.emit(
								"signal",
								socketListId,
								JSON.stringify({ ice: event.candidate })
							);
						}
					};

					// Wait for their video stream
					connections[socketListId].onaddstream = (event) => {
						// TODO mute button, full screen button
						let searchVidep = document.querySelector(
							`[data-socket="${socketListId}"]`
						);
						if (searchVidep !== null) {
							// if i don't do this check it make an empyt square
							searchVidep.srcObject = event.stream;
						} else {
							elms = clients.length;
							let main = document.getElementById("main");
							let cssMesure = changeCssVideos(main, elms);
							if (cssMesure) {
								let video = document.createElement("video");

								let css = {
									minWidth: cssMesure.minWidth,
									minHeight: cssMesure.minHeight,
									maxHeight: "100%",
									margin: "10px",
									borderStyle: "solid",
									borderColor: "#bdbdbd",
									objectFit: "fill",
								};
								for (let i in css) video.style[i] = css[i];

								video.style.setProperty(
									"width",
									cssMesure.width
								);
								video.style.setProperty(
									"height",
									cssMesure.height
								);
								video.setAttribute("data-socket", socketListId);
								video.srcObject = event.stream;
								video.autoplay = true;
								video.playsinline = true;

								main.appendChild(video);
							}
						}
					};

					// Add the local video stream
					if (
						window.localStream !== undefined &&
						window.localStream !== null
					) {
						connections[socketListId].addStream(window.localStream);
					} else {
						let blackSilence = (...args) =>
							new MediaStream([black(...args), silence()]);
						window.localStream = blackSilence();
						connections[socketListId].addStream(window.localStream);
					}
				});

				if (id === socketId) {
					for (let id2 in connections) {
						if (id2 === socketId) continue;

						try {
							connections[id2].addStream(window.localStream);
						} catch (e) {}

						// eslint-disable-next-line
						connections[id2].createOffer().then((description) => {
							connections[id2]
								.setLocalDescription(description)
								.then(() => {
									socket.emit(
										"signal",
										id2,
										JSON.stringify({
											sdp: connections[id2]
												.localDescription,
										})
									);
								})
								.catch((e) => console.log(e));
						});
					}
				}
			});
		});
	};

	const silence = () => {
		let ctx = new AudioContext();
		let oscillator = ctx.createOscillator();
		let dst = oscillator.connect(ctx.createMediaStreamDestination());
		ctx.resume();
		oscillator.start();
		ctx.resume();
		return Object.assign(dst.stream.getAudioTracks()[0], {
			enabled: false,
		});
	};
	const black = ({ width = 640, height = 480 } = {}) => {
		let canvas = Object.assign(document.createElement("canvas"), {
			width,
			height,
		});
		canvas.getContext("2d").fillRect(0, 0, width, height);
		let stream = canvas.captureStream();
		return Object.assign(stream.getVideoTracks()[0], { enabled: false });
	};

	const handleVideo = () => {
		setState({ ...state, video: !state.video });
	};
	const handleAudio = () => {
		setState({ ...state, audio: !state.audio });
	};
	const handleScreen = () => {
		setState({ ...state, screen: !state.screen });
	};

	const handleEndCall = () => {
		try {
			let tracks = localVideoref.current.srcObject.getTracks();
			tracks.forEach((track) => track.stop());
		} catch (e) {}
		history.push("/");
	};

	const openChat = () => {
		setState({ ...state, showModal: true, newmessages: 0 });
	};
	const closeChat = () => {
		setState({ ...state, showModal: false });
	};
	const handleMessage = (e) => {
		setState({ ...state, message: e.target.value });
	};

	const addMessage = (data, sender, socketIdSender) => {
		setState((prevState) => ({
			...state,
			messages: [...prevState.messages, { sender: sender, data: data }],
		}));
		if (socketIdSender !== socketId) {
			setState({ ...state, newmessages: state.newmessages + 1 });
		}
	};

	const handleUsername = (e) =>
		setState({ ...state, username: e.target.value });

	const sendMessage = () => {
		socket.emit("chat-message", state.message, state.username);
		setState({ ...state, message: "", sender: state.username });
	};

	const copyUrl = () => {
		let text = origin + pathname;
		if (!navigator.clipboard) {
			let textArea = document.createElement("textarea");
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			try {
				document.execCommand("copy");
				message.success("Link copied to clipboard!");
			} catch (err) {
				message.error("Failed to copy");
			}
			document.body.removeChild(textArea);
			return;
		}
		navigator.clipboard.writeText(text).then(
			function () {
				message.success("Link copied to clipboard!");
			},
			() => {
				message.error("Failed to copy");
			}
		);
	};

	useEffect(() => {
		if (!state.askForUsername) {
			getMedia();
		}
		// eslint-disable-next-line
	}, [state.askForUsername]);

	const connect = () => setState({ ...state, askForUsername: false });

	return !isChrome() ? (
		<div className="chrome__notifier">
			<h1>Sorry, this works only with Google Chrome</h1>
		</div>
	) : (
		<div>
			{state.askForUsername ? (
				<Center>
					<VStack>
						<div className="username-selector__container">
							<p className="username-selector__label">
								Set your username
							</p>
							<Input
								placeholder="Username"
								value={state.username}
								onChange={(e) => handleUsername(e)}
							/>
							<Button
								variant="contained"
								color="primary"
								onClick={connect}
								className="username-selector__button"
							>
								Connect
							</Button>
						</div>

						<Center>
							<div className="username-selector__preview_video_wrapper">
								<IconButton onClick={this.handleVideo}>
									{state.video === true ? (
										<VideocamIcon />
									) : (
										<VideocamOffIcon />
									)}
								</IconButton>
								<IconButton onClick={this.handleAudio}>
									{state.audio === true ? (
										<MicIcon />
									) : (
										<MicOffIcon />
									)}
								</IconButton>
								<video
									className="username-selector__preview_video"
									id="my-video1"
									ref={localVideoref}
									autoPlay
									muted
								/>
							</div>
						</Center>
					</VStack>
				</Center>
			) : (
				<div>
					<div className="video_call_screen__call_buttons">
						<IconButton
							className="video_call_screen__call_buttons--webcam-icon"
							onClick={handleVideo}
						>
							{state.video === true ? (
								<VideocamIcon />
							) : (
								<VideocamOffIcon />
							)}
						</IconButton>

						<IconButton
							className="video_call_screen__call_buttons--endcall-icon"
							onClick={handleEndCall}
						>
							<CallEndIcon />
						</IconButton>

						<IconButton
							className="video_call_screen__call_buttons--mic-icon"
							onClick={handleAudio}
						>
							{state.audio === true ? (
								<MicIcon />
							) : (
								<MicOffIcon />
							)}
						</IconButton>

						{state.screenAvailable === true ? (
							<IconButton
								className="video_call_screen__call_buttons--screenshare-icon"
								onClick={handleScreen}
							>
								{state.screen === true ? (
									<ScreenShareIcon />
								) : (
									<StopScreenShareIcon />
								)}
							</IconButton>
						) : null}

						<Badge
							badgeContent={state.newmessages}
							max={999}
							color="secondary"
							onClick={openChat}
						>
							<IconButton
								className="video_call_screen__call_buttons--chat-icon"
								onClick={openChat}
							>
								<ChatIcon />
							</IconButton>
						</Badge>
					</div>

					<Modal
						show={state.showModal}
						onHide={closeChat}
						className="video_call_screen__chat_modal"
					>
						<Modal.Header closeButton>
							<Modal.Title>Chat Room</Modal.Title>
						</Modal.Header>
						<Modal.Body className="video_call_screen__chat_modal__body">
							{state.messages && state.messages.length > 0 ? (
								state.messages.map((item, index) => (
									<div
										key={index}
										style={{ textAlign: "left" }}
									>
										<p
											style={{
												wordBreak: "break-all",
											}}
										>
											<b>{item.sender}</b>: {item.data}
										</p>
									</div>
								))
							) : (
								<p>No message yet</p>
							)}
						</Modal.Body>
						<Modal.Footer className="video_call_screen__chat_modal__footer">
							<Input
								placeholder="Message"
								value={state.message}
								onChange={(e) => handleMessage(e)}
							/>
							<Button
								variant="contained"
								color="primary"
								onClick={sendMessage}
								className="video_call_screen__chat_modal__send_button"
							>
								Send
							</Button>
						</Modal.Footer>
					</Modal>

					<div className="video_call_screen__invitation_link__container">
						<div style={{ paddingTop: "20px" }}>
							<Input value={origin + pathname} disable="true" />
							<Button
								className="video_call_screen__invitation_link__invite_button"
								variant="contained"
								onClick={copyUrl}
							>
								Copy invite link
							</Button>
						</div>

						<Row
							id="main"
							className="video_call_screen__video_stream_container"
						>
							<video
								id="my-video2"
								className="video_call_screen__video_stream"
								ref={localVideoref}
								autoPlay
								muted
							/>
						</Row>
					</div>
				</div>
			)}
		</div>
	);
};

export default Video;
