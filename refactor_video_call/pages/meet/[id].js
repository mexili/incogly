import React, {useRef,  useEffect} from "react";
import io from "socket.io-client";
import {useRecoilState} from 'recoil';

import { Button, Input } from "@material-ui/core";
import { IconButton, Badge} from "@material-ui/core";
import VideocamIcon from '@material-ui/icons/Videocam'
import VideocamOffIcon from '@material-ui/icons/VideocamOff'
import MicIcon from '@material-ui/icons/Mic'
import MicOffIcon from '@material-ui/icons/MicOff'
import ScreenShareIcon from '@material-ui/icons/ScreenShare'
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare'
import CallEndIcon from '@material-ui/icons/CallEnd'
import ChatIcon from '@material-ui/icons/Chat'



import { Row } from 'reactstrap'
import Modal from 'react-bootstrap/Modal'
import "bootstrap/dist/css/bootstrap.css";

import { isChrome, copyUrl, changeCssVideos } from "../../utils";
import { NavBar } from "../../components";
import {black, silence} from "../../utils"
import {
  videoAtom,
  audioAtom,
  screenAtom,
  screenAvailableAtom,
  messagesAtom,
  messageAtom,
  newMessagesAtom,
  askForUserNameAtom,
  userNameAtom
} from "../../global_state"

const server_url =
  process.env.NODE_ENV === "production"
    ? ""
    : "http://localhost:5000";

var connections = {};
const peerConnectionConfig = {
  iceServers: [
    // { 'urls': 'stun:stun.services.mozilla.com' },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};
var socket = null;
var socketId = null;
var elms = 0;


export default function Video() {
  const localVideoRef = useRef();
  let videoAvailable, audioAvailable = false;

  const [video, setVideo] = useRecoilState(videoAtom);
  const [audio, setAudio] = useRecoilState(audioAtom);
  const [screen, setScreen] = useRecoilState(screenAtom);
  const [screenAvailable, setScreenAvailable] = useRecoilState(screenAvailableAtom);
  const [messages, setMessages] = useRecoilState(messagesAtom);
  const [message, setMessage] = useRecoilState(messageAtom);
  const [newMessages, setNewMessages] = useRecoilState(newMessagesAtom);
  const [askForUserName, setAskForUserName] = useRecoilState(askForUserNameAtom);
  const [userName, setNewUserName] = useRecoilState(userNameAtom);

  const getPermissions = async () => {
    try {
      await navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => {videoAvailable = true})
        .catch(() => {videoAvailable = false});

      await navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {audioAvailable = true})
        .catch(() => {audioAvailable = false});

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true)
      } else {
        setScreenAvailable(false)
      }

      if (videoAvailable || audioAvailable) {
        navigator.mediaDevices
          .getUserMedia({
            video: videoAvailable,
            audio: audioAvailable,
          })
          .then((stream) => {
            window.localStream = stream;
            localVideoRef.current.srcObject = stream;
          })
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    } catch (e) {
      console.log(e);
    }
  }

  const connectToSocketServer = () => {
    // /123 , /meet/123
    socket = io.connect(server_url, { secure: true, path:'/api/v1/conference/join' });

    socket.on("signal", gotMessageFromServer);

    socket.on("connect", () => {
      console.log("Hello World", window.location.href)
      socket.emit("join-call", id);
      socketId = socket.id;

      socket.on("chat-message", addMessage);

      socket.on("user-left", (id) => {
        let video = document.querySelector(`[data-socket="${id}"]`);
        if (video !== null) {
          elms--;
          video.parentNode.removeChild(video);

          let main = document.getElementById("main");
          changeCssVideos(main);
        }
      });

      socket.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConnectionConfig
          );
          // Wait for their ice candidate
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socket.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // Wait for their video stream
          connections[socketListId].onaddstream = (event) => {
            // TODO mute button, full screen button
            console.log("Helol world")
            var searchVidep = document.querySelector(
              `[data-socket="${socketListId}"]`
            );
            if (searchVidep !== null) {
              // if i don't do this check it make an empyt square
              searchVidep.srcObject = event.stream;
            } else {
              elms = clients.length;
              let main = document.getElementById("main");
              let cssMesure = changeCssVideos(main);

              let video = document.createElement("video");

              let css = {
                minWidth: cssMesure.minWidth,
                minHeight: cssMesure.minHeight,
                maxHeight: "100%",
                margin: "10px",
                borderStyle: "solid",
                borderColor: "#bdbdbd",
                objectFit: "fill",
              };
              for (let i in css) video.style[i] = css[i];

              video.style.setProperty("width", cssMesure.width);
              video.style.setProperty("height", cssMesure.height);
              video.setAttribute("data-socket", socketListId);
              video.srcObject = event.stream;
              video.autoplay = true;
              video.playsinline = true;

              main.appendChild(video);
            }
          };

          // Add the local video stream
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketId) {
          for (let id2 in connections) {
            if (id2 === socketId) continue;

            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {}

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socket.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };


  const getMedia = () => {
    setVideo(videoAvailable)
    setAudio(audioAvailable)
    getUserMedia()
    connectToSocketServer()
  }

   const getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketId) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socket.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false)
          setAudio(false)
            try {
              let tracks = localVideoRef.current.srcObject.getTracks();
              tracks.forEach((track) => track.stop());
            } catch (e) {
              console.log(e);
            }

            let blackSilence = (...args) =>
              new MediaStream([this.black(...args), this.silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            for (let id in connections) {
              connections[id].addStream(window.localStream);

              connections[id].createOffer().then((description) => {
                connections[id]
                  .setLocalDescription(description)
                  .then(() => {
                    socket.emit(
                      "signal",
                      id,
                      JSON.stringify({
                        sdp: connections[id].localDescription,
                      })
                    );
                  })
                  .catch((e) => console.log(e));
              });
            }
        })
    );
  };


  const getUserMedia = () => {
    if (
      (video && videoAvailable) ||
      (audio && audioAvailable)
    ) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  const getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  const getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    console.log("Hello How are how")

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketId) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socket.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false)
              try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
              } catch (e) {
                console.log(e);
              }

              let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
              window.localStream = blackSilence();
              localVideoRef.current.srcObject = window.localStream;

              getUserMedia();
        })
    );
  };

  const gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);
      console.log("Hello World")

    if (fromId !== socketId) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socket.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  const handleVideo = () => {
    setVideo((video)=>!video)
    getUserMedia();
  }

  const handleAudio = () => {
    setAudio((audio)=>!audio)
    getUserMedia();
  }

  const handleScreen = () => {
    setScreen((screen)=>!screen)
    getDisplayMedia();
  }


  const connect = () => {
    setAskForUserName(false);
    getMedia()
  }


  const handleMessage = (e) => {
    setMessage(e.target.value);
  }

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessage)=>(
      [...prevMessage, {sender: sender, data: data}]
    ))

    if (socketIdSender !== socketId) {
      setNewMessages(newMessages+1)
      }
  }


  const handleUserName = (e) => {
    setUserName(e.target.value);
  }


  const handleEndCall = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    window.location.href = "/";
  }

  const openChat = () => {
    setShowModal(true)
    setNewMessages(0)
  }





  useEffect(()=>{
    connections = {}
    getPermissions()
  })

  if (isChrome() === false) {
      return (
        <div
          style={{
            background: "white",
            width: "30%",
            height: "auto",
            padding: "20px",
            minWidth: "400px",
            textAlign: "center",
            margin: "auto",
            marginTop: "50px",
            justifyContent: "center",
          }}
        >
          <h1>Sorry, this works only with Google Chrome</h1>
        </div>
      );
  }

  else {

return  (<div>
        {askForUserName === true ? (
          <div>
            <div
              style={{
                background: "white",
                width: "30%",
                height: "auto",
                padding: "20px",
                minWidth: "400px",
                textAlign: "center",
                margin: "auto",
                marginTop: "50px",
                justifyContent: "center",
              }}
            >
              <p
                style={{ margin: 0, fontWeight: "bold", paddingRight: "50px" }}
              >
                Set your username
              </p>
              <Input
                placeholder="Username"
                value={userName}
                onChange={(e) => handleUsername(e)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={connect}
                style={{ margin: "20px" }}
              >
                Connect
              </Button>
            </div>

            <div
              style={{
                justifyContent: "center",
                textAlign: "center",
                paddingTop: "40px",
              }}
            >
              <video
                id="my-video"
                ref={localVideoRef}
                autoPlay
                muted
                style={{
                  borderStyle: "solid",
                  borderColor: "#bdbdbd",
                  objectFit: "fill",
                  width: "60%",
                  height: "30%",
                }}
              ></video>
            </div>
          </div>
        ) : (
            <div>
            <div
              className="btn-down"
              style={{
                backgroundColor: "whitesmoke",
                color: "whitesmoke",
                textAlign: "center",
              }}
            >
              <IconButton
                style={{ color: "#424242" }}
                onClick={handleVideo}
              >
                {video === true ? (
                  <VideocamIcon />
                ) : (
                  <VideocamOffIcon />
                )}
              </IconButton>

              <IconButton
                style={{ color: "#f44336" }}
                onClick={handleEndCall}
              >
                <CallEndIcon />
              </IconButton>

              <IconButton
                style={{ color: "#424242" }}
                onClick={handleAudio}
              >
                {audio === true ? <MicIcon /> : <MicOffIcon />}
              </IconButton>

              {screenAvailable === true ? (
                <IconButton
                  style={{ color: "#424242" }}
                  onClick={handleScreen}
                >
                  {screen === true ? (
                    <ScreenShareIcon />
                  ) : (
                    <StopScreenShareIcon />
                  )}
                </IconButton>
              ) : null}

              <Badge
                badgeContent={newMessages}
                max={999}
                color="secondary"
                onClick={openChat}
              >
                <IconButton
                  style={{ color: "#424242" }}
                  onClick={openChat}
                >
                  <ChatIcon />
                </IconButton>
              </Badge>
            </div>


            <div className="container">
              <div style={{ paddingTop: "20px" }}>
                <Input value={window.location.href} disable="true" />
                <Button
                  style={{
                    backgroundColor: "#3f51b5",
                    color: "whitesmoke",
                    marginLeft: "20px",
                    marginTop: "10px",
                    width: "120px",
                    fontSize: "10px",
                  }}
                  onClick={copyUrl}
                >
                  Copy invite link
                </Button>
              </div>

              <Row
                id="main"
                className="flex-container"
                style={{ margin: 0, padding: 0 }}
              >
                <video
                  id="my-video"
                  ref={localVideoRef}
                  autoPlay
                  muted
                  style={{
                    borderStyle: "solid",
                    borderColor: "#bdbdbd",
                    margin: "10px",
                    objectFit: "fill",
                    width: "100%",
                    height: "100%",
                  }}
                />
              </Row>
            </div>
          </div>
        )}
      </div>)

  }
}

