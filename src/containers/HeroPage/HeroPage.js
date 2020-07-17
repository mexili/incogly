import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import * as Icon from "react-feather";
import { Link } from "react-router-dom";
import Header from "../Header/Header";
import gif from "../../assets/images/landing-hero.gif";
import "./heropage.css";

const HeroPage = () => {
  return (
    <>
      <Header />
      <div className="landing-container">
        <Container>
          <Row>
            <Col lg={6} className="image-wrapper">
              <img src={gif} alt="landing-hero" className="landing-hero" />
            </Col>
            <Col lg={6}>
              <div className="hero-text">
                <h1 className="hero-h1">
                  Connect & collaborate, without friction.
                </h1>
                <h3 className="hero-para">Go anonymous, Go incog.ly !</h3>
                <p className="hero-para">
                Incog.ly is a peer to peer video conferencing app which keeps your identity anonymous. With the feel by avatarifying the remote side into a character with the power of emotions and expressions.
                </p>
              </div>
            </Col>
          </Row>
          <Row className="collaborate-row">
            <Link to="/colab" style={{ textDecoration: "none" }}>
              <div className="on-hover">
                <h1 className="collaborate-h1">Start Collaborating</h1>
                <Icon.ArrowRight color="white" className="icon-right" />
              </div>
            </Link>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default HeroPage;
