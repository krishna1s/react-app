import React from "react";
import { Container, Typography } from "@mui/material";

import CypressLogo from "../components/SvgCypressLogo";

export default function Footer() {
  return (
    <Container maxWidth="sm" style={{ marginTop: 50 }}>
      <button data-test="important-button">I'm new and interactive</button>
      <a href="/a-previously-unknown-page">Link to a 404</a>
      <Typography variant="body2" color="textSecondary" align="center">
        Built by
        <a
          style={{ textDecoration: "none" }}
          target="_blank"
          rel="noopener noreferrer"
          href="https://cypress.io"
        >
          <CypressLogo
            style={{
              marginTop: -2,
              marginLeft: 5,
              height: "20px",
              width: "55px",
              verticalAlign: "middle",
            }}
          />
        </a>
      </Typography>
    </Container>
  );
}
