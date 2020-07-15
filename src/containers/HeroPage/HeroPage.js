import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import * as Icon from "react-feather";
import { Link } from "react-router-dom";
import Header from '../Header/Header';
import gif from '../../assets/images/landing-hero.gif'
import "./heropage.css";

const HeroPage = () => {
  return (
    <>
      <Header />
        <div className="landing-container">
      <Container>
        <Row>
          <Col lg={6} className="image-wrapper">
            <img
              src={gif}
              alt="landing-hero"
            />
          </Col>
          <Col lg={6}>
            <div className="hero-text">
              <h1 className="hero-h1">
                Code and collaborate, without friction.
              </h1>
              {/* <h3 className="hero-para">
                Go anonymous...
              </h3> */}
              <p className="hero-para">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo
                incidunt ipsum blanditiis quisquam hic quia, at nisi, possimus
                labore optio dicta vitae reprehenderit? Alias quis quisquam
                consequuntur sint maxime atque!
              </p>
            </div>
          </Col>
        </Row>
        <Row className="collaborate-row">
          <Link to="/collaborate"  style={{ textDecoration: 'none' }}>
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
