import { useState } from "react";
import { useRouter } from "next/router";
import { Container, Center, Input, Button } from "@chakra-ui/react";

export default function Home() {
  const [url, setURL] = useState("");
  const router = useRouter();

  const join = () => {
    if (url !== "") {
      let new_url = url.trim("/");
      router.push(`meet/${new_url}`);
    } else {
      let new_url = Math.random().toString(36).substring(2, 7);
      router.push(`meet/${new_url}`);
    }
  };

  return (
    <Container>
      <Center>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "45px" }}>Incogly</h1>
          <p style={{ fontWeight: "200" }}>
            This is incogly. We need a new homepage
          </p>
        </div>
      </Center>
      <Center>
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
          <Input placeholder="URL" onChange={(e) =>
            {
              setURL(e.target.value)
            }
            } />
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
