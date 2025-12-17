import { useRef, useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

export default function Bot() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [speciality, setSpeciality] = useState(null);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { doctors } = useContext(AppContext);
  const navigate = useNavigate();

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  /* ------------------ RECORDING ------------------ */

  const startRecording = async () => {
    if (recording) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];
    setRecording(true);

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      setAudioURL(URL.createObjectURL(blob));
      setRecording(false);
      stream.getTracks().forEach((t) => t.stop());
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  /* ------------------ SPECIALITY EXTRACTION ------------------ */

  const extractSpeciality = (text) => {
    const words = text.trim().split(" ");
    const last = words[words.length - 1];
    return last.charAt(0).toUpperCase() + last.slice(1);
  };

  /* ------------------ SEND ------------------ */

  const sendRequest = async () => {
    if (!audioBlob) return alert("Record audio first");

    setLoading(true);
    setResponseText("");
    setSpeciality(null);

    const formData = new FormData();
    formData.append("audio", audioBlob, "voice.webm");

    try {
      const res = await fetch(
        "https://prescripto-backend-3lvz.onrender.com/api/voice",
        { method: "POST", body: formData }
      );

      const data = await res.json();
      setResponseText(data.text);

      const extracted = extractSpeciality(data.text);
      setSpeciality(extracted);

      // SAME logic as Doctors.jsx
      setFilteredDoctors(
        doctors.filter((doc) => doc.speciality === extracted)
      );
    } catch {
      setError("Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ UI ------------------ */

  return (
    <section className="bg-[#f8f9ff] py-20">
      <div className="max-w-6xl mx-auto">

        {/* BOT CARD */}
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-[#5f6fff] text-center">
            Prescripto Assistant
          </h2>

          <div className="flex justify-center gap-4 mt-8">
            <button onClick={startRecording} disabled={recording}
              className="px-6 py-3 rounded-full bg-green-500 text-white">
              🎙 Start
            </button>
            <button onClick={stopRecording} disabled={!recording}
              className="px-6 py-3 rounded-full bg-red-500 text-white">
              ⏹ Stop
            </button>
          </div>

          {audioURL && (
            <div className="mt-4 flex justify-center">
              <audio controls src={audioURL} />
            </div>
          )}

          <div className="flex justify-center mt-6">
            <button
              onClick={sendRequest}
              disabled={loading}
              className="px-10 py-3 rounded-full bg-[#5f6fff] text-white"
            >
              {loading ? "Processing..." : "Send to Bot"}
            </button>
          </div>

          {responseText && (
            <div className="mt-6 bg-[#f1f3ff] p-5 rounded-xl">
              <p className="text-gray-700">{responseText}</p>
            </div>
          )}
        </div>

        {/* ------------------ EXPERT DOCTORS ------------------ */}
        {speciality && (
          <div className="mt-16">
            <h3 className="text-2xl font-semibold text-center text-[#262626]">
              Expert {speciality}s Available
            </h3>

            <div className="grid grid-cols-auto gap-6 mt-8">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => navigate(`/appointment/${doc._id}`)}
                  className="border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer
                             hover:translate-y-[-8px] transition-all"
                >
                  <img src={doc.image} className="bg-[#EAEFFF]" />
                  <div className="p-4">
                    <p className="text-lg font-medium">{doc.name}</p>
                    <p className="text-sm text-gray-500">{doc.speciality}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
