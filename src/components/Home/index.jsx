import React, { useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { Input, Button } from "@chakra-ui/react";
import { Container } from "react-bootstrap";
import "./Home.scss";
import NavBar from "../NavBar";

const Home = () => {
	const btn = useRef(null);
	const history = useHistory();
	const [roomId, setRoomId] = useState("");

	const handleChange = (e) => {
		setRoomId(e.target.value);
	};

	const handleKeyPress = (e) => {
		if (e.keyCode === 13) {
			btn.current.focus();
		}
	};
	const joinRoom = () => {
		let tempRoomId;
		if (roomId) tempRoomId = roomId.trim();
		else tempRoomId = Math.random().toString(36).substring(2, 7);
		history.push(`/${tempRoomId}`);
	};
	return (
		<div className="home_page__container">
			<NavBar />
			<Container>
				<div className="home_page__heading_grid">
					<div>
						<span className="home_page__heading">Connect</span>
						<span className="home_page__heading_sm">&amp;</span>
						<div className="">
							<span className="home_page__heading_2">
								Collaborate
							</span>{" "}
							<span className="home_page__heading_sm">
								without friction.
							</span>
						</div>
					</div>
					<div className="home_page__sub-heading">
						Go anonymous,
						<br />
						Go incogly.
					</div>
				</div>

				<div className="home_page__heading_grid">
					<div>
						<img
							src="/images/incogly-party.gif"
							alt="landing-page"
							className="home_page__landing_page_image"
						/>
					</div>

					<div className="home_page__url_container">
						<div>
							<p className="home_page__start_text">
								Start or join a meeting
							</p>
							<Input
								className="home_page__input_box"
								placeholder="Enter unique ID or link"
								value={roomId}
								onChange={handleChange}
								onKeyDown={handleKeyPress}
							/>
							<Button
								className="home_page__join_button"
								variant="contained"
								onClick={joinRoom}
								ref={btn}
								type="submit"
							>
								Start Collaborating
							</Button>
						</div>
					</div>
				</div>
			</Container>
		</div>
	);
};

export default Home;
