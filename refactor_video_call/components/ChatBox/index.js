import {useState} from "react";
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.css";


import { IconButton, Badge, Input, Button } from "@material-ui/core";

export default function ChatBox({messages, message, setMessage}) {

  const [showModal, setShowModal] = useState(false);

  const closeChat = () => {
    showModal(false);
  }

  const sendMessage = () => {
    socket.emit("chat-message", message, userName);
    // right now this is using prop drilling, need recoill form this
    setMessage("");
    // setSender(userName);
  }


  return (
            <Modal
              show={showModal}
              onHide={closeChat}
              style={{ zIndex: "999999" }}
            >
              <Modal.Header closeButton>
                <Modal.Title>Chat Room</Modal.Title>
              </Modal.Header>
              <Modal.Body
                style={{
                  overflow: "auto",
                  overflowY: "auto",
                  height: "400px",
                  textAlign: "left",
                }}
              >
                {messages.length > 0 ? (
                  messages.map((item, index) => (
                    <div key={index} style={{ textAlign: "left" }}>
                      <p style={{ wordBreak: "break-all" }}>
                        <b>{item.sender}</b>: {item.data}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No message yet</p>
                )}
              </Modal.Body>
              <Modal.Footer className="div-send-msg">
                <Input
                  placeholder="Message"
                  value={message}
                  onChange={(e) => handleMessage(e)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={sendMessage}
                >
                  Send
                </Button>
              </Modal.Footer>
            </Modal>

  )
}
