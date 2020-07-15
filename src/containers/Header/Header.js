import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

import "./header.css";

const Header = () => {
  return (
    <div className="header-container">
      <Navbar expand="lg" variant="dark">
        <Link to="/" style={{ textDecoration: "none" }}>
          <Navbar.Brand href="#home" classname="navbar-brand">
            Incog.ly
          </Navbar.Brand>
        </Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link href="#login">Login</Nav.Link>
            <Nav.Link href="#signup">Signup</Nav.Link>
            <Link to="/colab" style={{ textDecoration: "none" }}>
              <Nav.Link href="#collaborate">Collaborate</Nav.Link>
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
};

export default Header;