import React, { Component, useState } from "react";

import { Input, Button, IconButton } from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";
import "./Home.scss";

function Home() {
	const [url, setUrl] = useState("");

	const handleChange = (e) => {
		setUrl(e.target.value);
	};

	const join = () => {
		let tempUrl = "";
		if (url !== "") {
			tempUrl = url.split("");
			window.location.href = `/${tempUrl[tempUrl.lenght - 1]}`;
		} else {
			tempUrl = Math.random().toString(36).substring(2, 7);
			window.location.href = `/${tempUrl}`;
		}
	};

	return (
		<div className="container2">
			<div>
				<h1 style={{ fontSize: "45px" }}>Incogly</h1>
				<p style={{ fontWeight: "200" }}>We need a new web page</p>
			</div>

			<div
				style={{
					background: "white",
					width: "30%",
					height: "auto",
					padding: "20px",
					minWidth: "400px",
					textAlign: "center",
					margin: "auto",
					marginTop: "100px",
				}}
			>
				<p
					style={{
						margin: 0,
						fontWeight: "bold",
						paddingRight: "50px",
					}}
				>
					Start or join a meeting
				</p>
				<Input placeholder="URL" onChange={(e) => handleChange(e)} />
				<Button
					variant="contained"
					color="primary"
					onClick={join}
					style={{ margin: "20px" }}
				>
					Go
				</Button>
			</div>
		</div>
	);
}

export default Home;
