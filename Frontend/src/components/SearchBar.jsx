import React, { useState } from "react";
import { FaSearch, FaMicrophone } from "react-icons/fa";
import { useNotification } from "../context/NotificationContext";

function SearchBar({ setSearch }) {
  const { notify } = useNotification();
  const [text, setText] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    setSearch(value);
  };

  const startVoice = () => {

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      notify("Voice search not supported in this browser", "error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;

      setText(voiceText);
      setSearch(voiceText);
    };

    recognition.onerror = () => {
      notify("Voice recognition error. Try again.", "error");
    };

    recognition.start();
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        margin: "30px 0"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "700px",
          background: "white",
          borderRadius: "40px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
          padding: "10px 20px",
          gap: "10px"
        }}
      >
        <FaSearch style={{ color: "#777" }} />

        <input
          type="text"
          placeholder="Search yarn toys, sweaters, keychains..."
          value={text}
          onChange={handleChange}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "16px"
          }}
        />

        <FaMicrophone
          onClick={startVoice}
          style={{
            cursor: "pointer",
            color: "#ff5722",
            fontSize: "18px"
          }}
        />
      </div>
    </div>
  );
}

export default SearchBar;