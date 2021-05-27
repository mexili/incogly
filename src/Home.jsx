import React, { useState } from "react";

import { VStack, Spacer, Input, Button } from "@chakra-ui/react";
import "./Home.scss";
import NavBar from "./components/NavBar";

function Home() {
	const [url, setUrl] = useState("");

	const handleChange = (e) => {
		setUrl(e.target.value);
	};

	const join = () => {
		let tempUrl = "";
		if (url !== "") {
			tempUrl = url.trim();
		} else {
			tempUrl = Math.random().toString(36).substring(2, 7);
		}
		window.location.href = `/${tempUrl}`;
	};

	return (
		<div className="home_page__container">
			<NavBar />
			<VStack>
				<h1 className="home_page__heading">Connect & Collaborate,</h1>
				<h1 className="home_page__heading">without friction.</h1>
				<Spacer />
				<p className="home_page__sub-heading">
					Go anonymous, Go incogly.
				</p>
				<Spacer />
				<img src="/images/code-image.png" alt="Code" />

				<div
					style={{
						width: "30%",
						height: "auto",
						minWidth: "400px",
						textAlign: "center",
						margin: "auto",
						marginTop: "100px",
					}}
				>
					<VStack>
						<p className="home_page__text">
							Start or join a meeting
						</p>
						<Spacer />
						<Input
							className="home_page__input_box"
							placeholder="URL"
							onChange={(e) => handleChange(e)}
						/>
						<Spacer />
						<Button
							className="home_page__join-button"
							variant="contained"
							onClick={join}
						>
							Start Collaborating
						</Button>
					</VStack>
				</div>
			</VStack>
		</div>
	);
}

export default Home;
