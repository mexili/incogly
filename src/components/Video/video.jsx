import React, { useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import io from "socket.io-client";
import faker from "faker";
import { isChrome } from "../../utils";
import { IconButton, Badge, Input } from "@material-ui/core";
import { Center, VStack, Button } from "@chakra-ui/react";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";
import StopScreenShareIcon from "@material-ui/icons/StopScreenShare";
import CallEndIcon from "@material-ui/icons/CallEnd";
import ChatIcon from "@material-ui/icons/Chat";
import { message } from "antd";
import { Modal, Row } from "react-bootstrap";
import "antd/dist/antd.css";
import "bootstrap/dist/css/bootstrap.css";
import "./Video.scss";

const server_url =
	process.env.NODE_ENV === "production" ? "" : "http://localhost:5000";

const peerConnectionConfig = {
	iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

let socket = null;

const Video = () => {
	const history = useHistory();
	const userVideoRef = useRef(null);
	const { pathname, origin } = window.location;

	const [isGlobalVideoActive, setIsGlobalVideoActive] = useState(false);
	const [isGlobalAudioActive, setIsGlobalAudioActive] = useState(false);

	const [username, setUsername] = useState(faker.internet.userName());
	const [isAskForUsername, setIsAskForUsername] = useState(true);
	const [isVideoActive, setIsVideoActive] = useState(true);
	const [isAudioActive, setIsAudioActive] = useState(true);
	const [isScreenActive, setIsScreenActive] = useState(false);
	const [isChatModalOpen, setIsChatModalOpen] = useState(false);
	const [isScreenAvailable, setIsScreenAvailable] = useState(false);
	const [chatMessages, setChatMessages] = useState([]);
	const [userMessage, setUserMessage] = useState("");
	const [totalNewMessages, setTotalNewMessages] = useState(0);

	const connections = {};

	const handleToggleVideo = () => setIsVideoActive(!isVideoActive);
	const handleToggleAudio = () => setIsAudioActive(!isAudioActive);
	const handleToggleScreen = () => setIsScreenActive(!isScreenActive);
	const handleToggleChatModal = () => {
		if (!isChatModalOpen) {
			setTotalNewMessages(0);
		}
		setIsChatModalOpen(!isChatModalOpen);
	};
	const sendChatMessage = () => {
		if (socket) socket.emit("chat-message", userMessage, username);
		setUserMessage("");
	};

	const handleEndCall = () => {
		if (socket) socket = null;
		try {
			let tracks = userVideoRef.current.srcObject.getTracks();
			tracks.forEach((track) => track.stop());
		} catch (err) {
			console.log(err);
		}
		setTimeout(() => {
			history.push("/");
		}, 100);
	};

	const handleCopyUrl = () => {
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
			() => {
				message.success("Link copied to clipboard!");
			},
			() => {
				message.error("Failed to copy");
			}
		);
	};

	// Callback Functions

	const getPermissions = async () => {
		try {
			const videoValidation = await navigator.mediaDevices.getUserMedia({
				video: true,
			});
			if (videoValidation.active) setIsGlobalVideoActive(true);
			else setIsGlobalVideoActive(false);

			const audioValidation = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});
			if (audioValidation.active) setIsGlobalAudioActive(true);
			else setIsGlobalAudioActive(false);

			if (navigator.mediaDevices.getDisplayMedia) {
				setIsScreenAvailable(true);
			} else {
				setIsScreenAvailable(false);
			}

			if (isVideoActive || isAudioActive) {
				navigator.mediaDevices
					.getUserMedia({
						video: isVideoActive,
						audio: isAudioActive,
					})
					.then((stream) => {
						window.localStream = stream;
						userVideoRef.current.srcObject = window.localStream;
					})
					.then((stream) => {})
					.catch((e) => console.log(e));
			}
		} catch (e) {
			return null;
		}
	};

	// Callback Functions

	useEffect(() => {
		getPermissions();
		// eslint-disable-next-line
	}, [isAskForUsername, isVideoActive, isAudioActive]);

	useEffect(() => {
		socket = io.connect(server_url, {
			secure: true,
			path: "/api/v1/conference/join",
		});

		socket.on("signal", gotMessageFromServer);
	}, []);

	if (!isChrome()) {
		return null;
	}
	return (
		<>
			{isAskForUsername && (
				<Center>
					<VStack>
						<div className="username-selector__container">
							<p className="username-selector__label">
								Set your username
							</p>
							<div className="username-selector__input_container">
								<Input
									placeholder="Username"
									value={username}
									onChange={(e) =>
										setUsername(e.target.value)
									}
								/>
								<Button
									variant="contained"
									color="primary"
									onClick={() => setIsAskForUsername(false)}
									className="username-selector__button"
								>
									Connect
								</Button>
							</div>
						</div>

						<Center>
							<div className="username-selector__preview_video_wrapper">
								{/* <IconButton onClick={handleToggleVideo}>
									{isVideoActive ? (
										<VideocamIcon />
									) : (
										<VideocamOffIcon />
									)}
								</IconButton>
								<IconButton onClick={handleToggleAudio}>
									{isAudioActive ? (
										<MicIcon />
									) : (
										<MicOffIcon />
									)}
								</IconButton> */}
								<video
									className="username-selector__preview_video"
									id="my-video1"
									ref={userVideoRef}
									autoPlay
									muted
								/>
							</div>
						</Center>
					</VStack>
				</Center>
			)}
			{!isAskForUsername && (
				<div>
					<div className="video_call_screen__call_buttons">
						<IconButton
							className="video_call_screen__call_buttons--webcam-icon"
							onClick={handleToggleVideo}
						>
							{isVideoActive ? (
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
							onClick={handleToggleAudio}
						>
							{isAudioActive ? <MicIcon /> : <MicOffIcon />}
						</IconButton>

						{isScreenAvailable && (
							<IconButton
								className="video_call_screen__call_buttons--screenshare-icon"
								onClick={handleToggleScreen}
							>
								{isScreenActive ? (
									<ScreenShareIcon />
								) : (
									<StopScreenShareIcon />
								)}
							</IconButton>
						)}

						<Badge
							badgeContent={totalNewMessages}
							max={999}
							color="secondary"
							onClick={handleToggleChatModal}
						>
							<IconButton
								className="video_call_screen__call_buttons--chat-icon"
								onClick={handleToggleChatModal}
							>
								<ChatIcon />
							</IconButton>
						</Badge>
					</div>

					<Modal
						show={isChatModalOpen}
						onHide={handleToggleChatModal}
						className="video_call_screen__chat_modal"
					>
						<Modal.Header closeButton>
							<Modal.Title>Chat Room</Modal.Title>
						</Modal.Header>
						<Modal.Body className="video_call_screen__chat_modal__body">
							{chatMessages && chatMessages.length ? (
								chatMessages.map((item, index) => (
									<div
										key={`chat-messages-${index}`}
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
								value={userMessage}
								onChange={(e) => setUserMessage(e.target.value)}
							/>
							<Button
								variant="contained"
								color="primary"
								onClick={sendChatMessage}
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
								onClick={handleCopyUrl}
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
								ref={userVideoRef}
								autoPlay
								muted
							/>
						</Row>
					</div>
				</div>
			)}
		</>
	);
};

export default Video;
