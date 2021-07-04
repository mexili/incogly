import React from "react";
import { HStack, Center, Spacer, Button } from "@chakra-ui/react";
import "./index.scss";

function NavBar() {
	return (
		<div className="navbar__container">
			<HStack>
				<div className=" navbar__nav-item  navbar__heading">
					Incogly
				</div>
				<Spacer />
				<Center>
					<div className="navbar__nav-item">Discover</div>
					<div className="navbar__nav-item">Blog</div>
					<div className="navbar__nav-item">GitHub</div>
					<div className="navbar__nav-item">Discord</div>
				</Center>
				<Spacer />
				<HStack>
					<Button
						variant="contained"
						className="navbar__nav-item navbar__button navbar__button--dark"
					>
						Login
					</Button>
					<Spacer />
					<Button
						variant="contained"
						className="navbar__nav-item navbar__button navbar__button--pink"
					>
						Sign Up
					</Button>
				</HStack>
			</HStack>
		</div>
	);
}

export default NavBar;
