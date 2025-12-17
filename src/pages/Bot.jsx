import { useState, useRef } from "react";

export default function VoiceImagePost() {
  const [audioBlob, setAudioBlob] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [responseAudio, setResponseAudio] = useState(null);
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  /* ------------------ AUDIO RECORDING ------------------ */

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
  };

  /* ------------------ SUBMIT ------------------ */

  const handleSubmit = async () => {
    if (!audioBlob) {
      alert("Please record audio first");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("audio", audioBlob, "voice.webm");

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await fetch("https://prescripto-backend-3lvz.onrender.com", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setResponseText(data.text);
      setResponseAudio(data.audio);
    } catch (err) {
      console.error(err);
      alert("Request failed");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ UI ------------------ */

  return (
    <div style={{ maxWidth: 500, margin: "auto" }}>
      <h2>Voice + Image Upload</h2>

      {/* Image (Optional) */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
      />

      {/* Audio Controls */}
      <div style={{ marginTop: 10 }}>
        <button onClick={startRecording}>🎙 Start</button>
        <button onClick={stopRecording}>⏹ Stop</button>
      </div>

      {audioBlob && (
        <audio controls src={URL.createObjectURL(audioBlob)} />
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: 10 }}
      >
        {loading ? "Processing..." : "Send"}
      </button>

      {/* Response */}
      {responseText && (
        <div style={{ marginTop: 20 }}>
          <h3>Response Text</h3>
          <p>{responseText}</p>
        </div>
      )}

      {responseAudio && (
        <div>
          <h3>Response Voice</h3>
          <audio controls src={responseAudio} />
        </div>
      )}
    </div>
  );
}
