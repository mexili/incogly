import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

import "./header.css";

const Header = () => {
  return (
    <div className="header-container">
      <Navbar expand="lg" variant="dark">
          <Navbar.Brand href="/" className="navbar-brand">
            Incog.ly
          </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link href="https://devpost.com/software/half-mile-hackathon">Blog</Nav.Link>
            <Nav.Link href="https://github.com/stealthanthrax/half-mile-hackathon">Github</Nav.Link>
            <div className="colab-button">
              <Nav.Link href="/colab">Create room</Nav.Link>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
};

export default Header;