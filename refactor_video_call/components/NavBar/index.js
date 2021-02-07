// import getuserMedia

import { IconButton, Badge, Input, Button } from "@material-ui/core";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";
import StopScreenShareIcon from "@material-ui/icons/StopScreenShare";
import CallEndIcon from "@material-ui/icons/CallEnd";
import ChatIcon from "@material-ui/icons/Chat";

import {ChatBox} from "../../components"
import {isChrome, copyUrl} from "../../utils";
import { Row } from "reactstrap";


export default function NavBar({video, screenAvailable, audio, localVideoRef, handleVideo, handleAudio, handleScreen}) {

  // need to use Recoil for open chat button, messages
  let newMessages=0;

  const handleEndCall = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    window.location.href = "/";
  }

  const openChat = () => {
    // setShowModal(true)
    // setNewMessages(0)
  }

  // const messages = []
  // const message = []
  // const setMessage = () => {}


  const addMessage = (data, sender, socketIdSender) => {
    // setMessages((prevMessage)=>(
    //   [...prevMessage, {sender: sender, data: data}]
    // ))

    // if (socketIdSender !== socketId) {
    //   setNewMessages(newMessages+1)
    //   }
  }


  return (
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


            {/* <ChatBox messages={messages} message={message} setMesage={setMessage} /> */}

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
                ></video>
              </Row>
            </div>
          </div>
  )
}
