import React, { useState } from "react";
import { HStack, Center, Spacer } from "@chakra-ui/react";
import "./index.scss";

function NavBar() {
	return (
		<div className="navbar__container">
			<HStack>
				<div className=" navbar__nav-item  navbar__heading">
					Incogly
				</div>
				<Spacer />
				<div className="navbar__nav-item">Discover</div>
				<div className="navbar__nav-item">Blog</div>
				<div className="navbar__nav-item">GitHub</div>
				<div className="navbar__nav-item">Discord</div>
				<Spacer />
				<HStack>
					<div className="navbar__nav-item navbar__button navbar__button--dark">
						Login
					</div>
					<Spacer />
					<div className="navbar__nav-item navbar__button navbar__button--pink">
						Sign Up
					</div>
				</HStack>
			</HStack>
		</div>
	);
}

export default NavBar;
