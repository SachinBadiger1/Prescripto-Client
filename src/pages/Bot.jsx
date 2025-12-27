import { useContext, useRef, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

export default function VoiceDoctorAssistant() {
  const { doctors } = useContext(AppContext);
  const navigate = useNavigate();

  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [speciality, setSpeciality] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  /* ---------------- AUDIO RECORDING ---------------- */

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
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  /* ---------------- API CALL ---------------- */

  const handleSubmit = async () => {
    if (!audioBlob) {
      setError("Please record audio first");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setFilteredDoctors([]);

    const formData = new FormData();
    formData.append("audio", audioBlob, "voice.webm");
    if (image) formData.append("image", image);

    try {
      const res = await fetch("http://192.168.14.35:5000/process", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setResult(data);

      /* --------- EXTRACT SPECIALITY --------- */
      const words = data.doctor_response.trim().split(/\s+/);
 const raw = words[words.length - 1];

// remove trailing punctuation like . , ! ?
const clean = raw.replace(/[.,!?]$/, "");

const extractedSpeciality =
  clean.charAt(0).toUpperCase() + clean.slice(1);


      setSpeciality(extractedSpeciality);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FILTER DOCTORS (SAME LOGIC AS Doctors.jsx) ---------------- */

  useEffect(() => {
    if (speciality) {
      setFilteredDoctors(
        doctors.filter((doc) => doc.speciality === speciality)
      );
    }
  }, [speciality, doctors]);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* -------- INPUT CARD -------- */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Voice Doctor Assistant</h2>

          <button
            onClick={recording ? stopRecording : startRecording}
            className={`px-4 py-2 rounded text-white
              ${recording ? "bg-red-600" : "bg-green-600"}`}
          >
            {recording ? "Stop Recording" : "Start Recording"}
          </button>

          {audioBlob && (
            <audio controls className="w-full">
              <source src={URL.createObjectURL(audioBlob)} />
            </audio>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {loading ? "Processing..." : "Submit"}
          </button>

          {error && <p className="text-red-600">{error}</p>}
        </div>

        {/* -------- RESPONSE -------- */}
        {result && (
          <div className="bg-white rounded-xl shadow p-6 space-y-2">
            <p><b>Speech:</b> {result.speech_to_text}</p>
            <p><b>Doctor Response:</b> {result.doctor_response}</p>
            <p className="text-blue-600 font-medium">
              Showing doctors for: {speciality}
            </p>
          </div>
        )}

        {/* -------- DOCTORS LIST (SAME UI STYLE) -------- */}
        {filteredDoctors.length > 0 && (
          <div className="grid grid-cols-auto gap-4 gap-y-6">
            {filteredDoctors.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  navigate(`/appointment/${item._id}`);
                  scrollTo(0, 0);
                }}
                className="border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all"
              >
                <img className="bg-[#EAEFFF]" src={item.image} alt="" />
                <div className="p-4">
                  <div
                    className={`flex items-center gap-2 text-sm ${
                      item.available ? "text-green-500" : "text-gray-500"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.available ? "bg-green-500" : "bg-gray-500"
                      }`}
                    ></span>
                    {item.available ? "Available" : "Not Available"}
                  </div>
                  <p className="text-lg font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.speciality}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

