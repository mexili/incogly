import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
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
          <div>
            <div className="hero-text">
                <h1 className="hero-h1">
                  Connect & collaborate,<br />
                  without friction.
                </h1> 
                <h3 className="hero-para"><b>Go anonymous, Go incog.ly !</b></h3>

                {/*<p className="hero-para">
                Incog.ly is a peer to peer video conferencing app which keeps your identity anonymous. With the feel by avatarifying the remote side into a character with the power of emotions and expressions.
                </p>*/}
                
            </div>
            
            <div className="image-wrapper">
              <img src={gif} alt="landing-hero" className="landing-hero" />
            </div>

          </div>
          <Row className="collaborate-row">
            <Link to="/colab" style={{ textDecoration: "none" }}>
              <div className="on-hover">
                <h1 className="collaborate-h1">Start Collaborating</h1>
              </div>
            </Link>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default HeroPage;
