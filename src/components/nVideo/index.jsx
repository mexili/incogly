import React, { useEffect, useRef } from "react";
import Peer from "peerjs";
import io from "socket.io-client";

import "./video.scss";

// const server_url =
// 	process.env.NODE_ENV === "production"
// 		? "https://incog-317412.el.r.appspot.com/"
// 		: "https://incog-317412.el.r.appspot.com/";
const server_url = "https://incog-317412.el.r.appspot.com/";

const Video = ({ match }) => {
	const socketRef = useRef(null);
	const peerRef = useRef(null);

	useEffect(() => {
		socketRef.current = io.connect(server_url, {
			secure: true,
			path: "/api/v1/conference/join",
		});
		socketRef.current = new Peer();
	}, []);
	return (
		<>
			<div>Yo</div>
		</>
	);
};

export default Video;
