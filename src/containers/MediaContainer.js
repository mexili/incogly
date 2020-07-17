import React, { Component } from "react";
import { PropTypes } from "prop-types";
import {
  loadModels,
  getFullFaceDescription,
  getFaceExpressions,
  createMatcher,
} from "../api/face";

import Avatar, { Piece } from "avataaars";
// Import face profile

const JSON_PROFILE = require("../descriptors/bnk48.json");

const WIDTH = 500;
const HEIGHT = 500;
const inputSize = 160;
const randomChoice = (array) => array[Math.floor(Math.random() * array.length)];
const clothes = randomChoice(['BlazerShirt', 'BlazerSweater', 'CollarSweater', 'Hoodie', 'Overall'])
const top = randomChoice(['NoHair', 'EyePatch','LongHairMiaWallace', 'Hat', 'Hijab', 'Turban', 'WinterHat1', 'LongHairBigHair', 'ShortHairSides', 'ShortHairFrizzle'])
const accessories = randomChoice(['Blank', 'Prescription01', 'Prescription02', 'Round', 'Wayfarers'])
const skinColor = randomChoice(['Light', 'Pale', 'Brown', 'Yellow', 'Tanned', 'DarkBrown', 'Black'])
const mouth = {'neutral': 'Twinkle', 'happy': 'Smile', 'sad':  'Sad', 'angry': 'Grimace', 'fearful': 'ScreamOpen', 'disgusted': 'Vomit', 'surprised': 'Disbelief'}
const eyes = {'neutral': 'Default', 'happy': 'Happy', 'sad':  'Cry', 'angry': 'Squint', 'fearful': 'Dizzy', 'disgusted': 'Squint', 'surprised': 'Surprised'}
const eyeBrows = {'neutral': 'DefaultNatural', 'happy': 'Default', 'sad':  'SadConcernedNatural', 'angry': 'AngryNatural', 'fearful': 'SadConcernedNatural', 'disgusted': 'SadConcernedNatural', 'surprised': 'RaisedExcitedNatural'}


class MediaBridge extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bridge: "",
      user: "",
      fullDesc: null,
      detections: null,
      descriptors: null,
      faceMatcher: null,
      match: null,
      facingMode: null,
      expression: null,
      video: true,
      _X: 0,
    };
    this.onRemoteHangup = this.onRemoteHangup.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.sendData = this.sendData.bind(this);
    this.setupDataHandlers = this.setupDataHandlers.bind(this);
    this.setDescription = this.setDescription.bind(this);
    this.sendDescription = this.sendDescription.bind(this);
    this.hangup = this.hangup.bind(this);
    this.init = this.init.bind(this);
    this.setDescription = this.setDescription.bind(this);
    this.loadApis = this.loadApis.bind(this);
    this.startCapture = this.startCapture.bind(this);
    this.capture = this.capture.bind(this);
    this.extractScreenshot = this.extractScreenshot.bind(this);
  }

  componentWillMount() {
    // chrome polyfill for connection between the local device and a remote peer
    window.RTCPeerConnection =
      window.RTCPeerConnection || window.webkitRTCPeerConnection;
    this.props.media(this);
    // Promise.resolve(loadModels());
    this.loadApis();
    // this.setState({ faceMatcher: Promise.resolve( createMatcher(JSON_PROFILE) )});
    // this.setInputDevice();
  }

  async loadApis() {
    this.startCapture();
    try {
      await loadModels();
    } catch (e) {
      console.log(e.message);
    }
    this.setState({
      faceMatcher: Promise.resolve(createMatcher(JSON_PROFILE)),
    });
  }

  startCapture() {
    this.interval = setInterval(() => {
      this.capture();
    }, 1500);
  }

  extractScreenshot(videoSource) {
    var canvas = document.createElement("canvas");
    var video = videoSource;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas
      .getContext("2d")
      .drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    canvas.toBlob = (blob) => {
      const img = new Image();
      img.src = window.URL.createObjectUrl(blob);
    };
    return canvas.toDataURL("image/webp", 0.92);
  }

  // getScreenshot() {
  //   const canvas = this.getCanvas();
  //   return (
  //     canvas &&
  //     canvas.toDataURL()
  //   );
  // }

  async capture() {
    // console.log("MediaBridge -> capture -> this.localVideo", this.extractScreenshot())
    // this.extractScreenshot();

    if (!!this.localVideo) {
      await getFullFaceDescription(
        this.extractScreenshot(this.remoteVideo),
        inputSize
      )
        .then((fullDesc) => {
          // console.log("HEER")

          if (!!fullDesc) {
            console.log("MediaBridge -> capture -> fullDesc", fullDesc);
            this.setState({ _X: fullDesc[0].detection.box._x });
            const resizedResults = fullDesc[0] && fullDesc[0].expressions;
            const minConfidence = 0.05;
            const exprObj =
              resizedResults &&
              resizedResults.filter((expr) => expr.probability > minConfidence);
            let maxCallback = (acc, cur) => {
              acc["expression"] =
                acc.probability > cur.probability
                  ? acc.expression
                  : cur.expression;
              acc["probability"] = Math.max(acc.probability, cur.probability);
              return acc;
            };

            const output = exprObj && exprObj.reduce(maxCallback);
            this.setState({
              detections: fullDesc.map((fd) => fd.detection),
              descriptors: fullDesc.map((fd) => fd.descriptor),
              expression: output ? output.expression : null,
            });
          }
        })
        .catch((e) => console.log(e));

      // if (!!this.state.descriptors && !!this.state.faceMatcher) {
      //   let match = await this.state.descriptors.map(descriptor =>
      //     this.state.faceMatcher.findBestMatch(descriptor)
      //   );
      //   this.setState({ match });
      // }
    }
  }

  componentDidMount() {
    this.props.getUserMedia.then(
      (stream) => (this.localVideo.srcObject = this.localStream = stream)
    );
    this.props.socket.on("message", this.onMessage);
    this.props.socket.on("hangup", this.onRemoteHangup);
  }
  componentWillUnmount() {
    this.props.media(null);
    if (this.localStream !== undefined) {
      this.localStream.getVideoTracks()[0].stop();
    }
    this.props.socket.emit("leave");
  }
  onRemoteHangup() {
    this.setState({ user: "host", bridge: "host-hangup" });
  }
  onMessage(message) {
    if (message.type === "offer") {
      // set remote description and answer
      this.pc.setRemoteDescription(new RTCSessionDescription(message));
      this.pc
        .createAnswer()
        .then(this.setDescription)
        .then(this.sendDescription)
        .catch(this.handleError); // An error occurred, so handle the failure to connect
    } else if (message.type === "answer") {
      // set remote description
      this.pc.setRemoteDescription(new RTCSessionDescription(message));
    } else if (message.type === "candidate") {
      // add ice candidate
      this.pc.addIceCandidate(
        new RTCIceCandidate({
          sdpMLineIndex: message.mlineindex,
          candidate: message.candidate,
        })
      );
    }
  }
  sendData(msg) {
    this.dc.send(JSON.stringify(msg));
  }
  // Set up the data channel message handler
  setupDataHandlers() {
    this.dc.onmessage = (e) => {
      var msg = JSON.parse(e.data);
      console.log("received message over data channel:" + msg);
    };
    this.dc.onclose = () => {
      this.remoteStream.getVideoTracks()[0].stop();
      console.log("The Data Channel is Closed");
    };
  }
  setDescription(offer) {
    this.pc.setLocalDescription(offer);
  }
  // send the offer to a server to be forwarded to the other peer
  sendDescription() {
    this.props.socket.send(this.pc.localDescription);
  }
  hangup() {
    this.setState({ user: "guest", bridge: "guest-hangup" });
    this.pc.close();
    this.props.socket.emit("leave");
  }
  handleError(e) {
    console.log(e);
  }
  init() {
    // wait for local media to be ready
    const attachMediaIfReady = () => {
      this.dc = this.pc.createDataChannel("chat");
      this.setupDataHandlers();
      console.log("attachMediaIfReady");
      this.pc
        .createOffer()
        .then(this.setDescription)
        .then(this.sendDescription)
        .catch(this.handleError); // An error occurred, so handle the failure to connect
    };
    // set up the peer connection
    // this is one of Google's public STUN servers
    // make sure your offer/answer role does not change. If user A does a SLD
    // with type=offer initially, it must do that during  the whole session
    this.pc = new RTCPeerConnection({
      iceServers: [{ url: "stun:stun.l.google.com:19302" }],
    });
    // when our browser gets a candidate, send it to the peer
    this.pc.onicecandidate = (e) => {
      console.log(e, "onicecandidate");
      if (e.candidate) {
        this.props.socket.send({
          type: "candidate",
          mlineindex: e.candidate.sdpMLineIndex,
          candidate: e.candidate.candidate,
        });
      }
    };
    // when the other side added a media stream, show it on screen
    this.pc.onaddstream = (e) => {
      console.log("onaddstream", e);
      this.remoteStream = e.stream;
      this.remoteVideo.srcObject = this.remoteStream = e.stream;
      this.setState({ bridge: "established" });
    };
    this.pc.ondatachannel = (e) => {
      // data channel
      this.dc = e.channel;
      this.setupDataHandlers();
      this.sendData({
        peerMediaStream: {
          video: this.localStream.getVideoTracks()[0].enabled,
        },
      });
      //sendData('hello');
    };
    // attach local media to the peer connection
    this.localStream
      .getTracks()
      .forEach((track) => this.pc.addTrack(track, this.localStream));
    // call if we were the last to connect (to increase
    // chances that everything is set up properly at both ends)
    if (this.state.user === "host") {
      this.props.getUserMedia.then(attachMediaIfReady);
    }
  }
  render() {
    const { detections, expression, match, facingMode } = this.state;
    let drawBox = null;
    // if (!!detections) {
    //   drawBox = detections.map(
    //     (detection, i) => {
    // let _X = detection.box._x;
    return (
      <div className={`media-bridge ${this.state.bridge}`}>
        <video
          className="remote-video"
          ref={(ref) => (this.remoteVideo = ref)}
          autoPlay
        ></video>
        <video
          className="local-video"
          ref={(ref) => (this.localVideo = ref)}
          autoPlay
          muted
        ></video>
        {/* <div key={i} >
          {!!match && !!match[i] ? ( */}
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            zIndex: 8,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          {
            /*TODO: Replacement for the hardcoded translateX center value */
            console.log("STATE X", this.state._X)
          }
          <Avatar
            style={{
              transform: `translateX(${270 - this.state._X}px)`,
              width: "50%",
              height: "100%",
            }}
            avatarStyle="Square"
            topType={top}
            accessoriesType={accessories}
            hairColor="BrownDark"
            facialHairType="Blank"
            clotheType={clothes}
            clotheColor="PastelBlue"
            eyeType={eyes[expression]}
            eyebrowType={eyeBrows[expression]}
            mouthType={mouth[expression]}
            skinColor={skinColor}
          />
        </div>
      </div>
    );
    // })
    // }
    // }
  }
}

MediaBridge.propTypes = {
  socket: PropTypes.object.isRequired,
  getUserMedia: PropTypes.object.isRequired,
  media: PropTypes.func.isRequired,
};
export default MediaBridge;
