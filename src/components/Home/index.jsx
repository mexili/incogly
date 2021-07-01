import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { VStack, Spacer, Input, Button } from "@chakra-ui/react";
import "./Home.scss";
import NavBar from "../NavBar";

const Home = () => {
	const history = useHistory();
	const [roomId, setRoomId] = useState("");

	const joinRoom = () => {
		let tempRoomId;
		if (roomId) tempRoomId = roomId.trim();
		else tempRoomId = Math.random().toString(36).substring(2, 7);
		history.push(`/${tempRoomId}`);
	};

	return (
		<div className="home_page__container">
			<NavBar />
			<VStack>
				<h1 className="home_page__heading">
					Connect &amp; Collaborate,
				</h1>
				<h1 className="home_page__heading">without friction.</h1>
				<p className="home_page__sub-heading">
					Go anonymous, Go incogly.
				</p>
				<img
					src="https://cdn.dribbble.com/users/37380/screenshots/10883216/zoom-party4_12fps.gif"
					alt="landing-page"
					className="home_page__image"
				/>
				<Spacer />

				<div className="home_page__url_container">
					<VStack>
						<p className="home_page__text">
							Start or join a meeting
						</p>
						<Input
							className="home_page__input_box"
							placeholder="URL"
							value={roomId}
							onChange={(e) => setRoomId(e.target.value)}
						/>
						<Spacer />
						<Button
							className="home_page__join_button"
							variant="contained"
							onClick={joinRoom}
						>
							Start Collaborating
						</Button>
					</VStack>
				</div>
			</VStack>
		</div>
	);
};

export default Home;
