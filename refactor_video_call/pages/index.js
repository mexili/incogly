import { useState } from "react";

import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

import { Container, Center, Input, Button } from "@chakra-ui/react";

export default function Home() {
  const [url, setURL] = useState("");
  const router = useRouter();

  const join = () => {
    if (url !== "") {
      let new_url = url.split("/");
      router.push(new_url);
    } else {
      let new_url = Math.random().toString(36).substring(2, 7);
      router.push(new_url);
    }
  };

  return (
    <Container>
      <Center>
        <div>
          <h1 style={{ fontSize: "45px" }}>Video Meeting</h1>
          <p style={{ fontWeight: "200" }}>
            Video conference website that lets you stay in touch with all your
            friends.
          </p>
        </div>
        <div
          style={{
            background: "white",
            width: "30%",
            height: "auto",
            padding: "20px",
            minWidth: "400px",
            textAlign: "center",
            margin: "auto",
            marginTop: "100px",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold", paddingRight: "50px" }}>
            Start or join a meeting
          </p>
          <Input placeholder="URL" onChange={(e) => setURL(e.target.value)} />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              join();
            }}
            style={{ margin: "20px" }}
          >
            Go
          </Button>
        </div>
      </Center>
    </Container>
  );
}
