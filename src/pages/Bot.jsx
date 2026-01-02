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
      // const res = await fetch("https://assistant-zwec.onrender.com//process", {
      const res = await fetch("http://10.190.181.130:5000", {

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

      if (extractedSpeciality === "Physician")
        setSpeciality("General physician")
      else
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
  <div className="min-h-screen bg-[#F6F8FF] px-4 py-8">
    <div className="max-w-6xl mx-auto space-y-8">

      {/* ===== Header ===== */}
      <div className="bg-gradient-to-r from-[#5F6FFF] to-[#7B8CFF] rounded-2xl p-8 text-white shadow">
        <h1 className="text-3xl font-semibold">Voice Doctor Assistant</h1>
        <p className="mt-2 text-sm opacity-90">
          Describe your symptoms using voice and get matched with the right specialist.
        </p>
      </div>

      {/* ===== Input Card ===== */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-5">
        <h2 className="text-xl font-semibold text-gray-800">
          Record your symptoms
        </h2>

        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`px-6 py-2 rounded-full text-white font-medium transition
              ${
                recording
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {recording ? "Stop Recording" : "Start Recording"}
          </button>

          <span className="text-sm text-gray-500">
            {recording ? "Listening..." : "Tap to start recording"}
          </span>
        </div>

        {/* ===== Latest Audio Preview ONLY ===== */}
        {audioBlob && (
          <audio
            controls
            className="w-full mt-2"
            src={URL.createObjectURL(audioBlob)}
          />
        )}

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="text-sm"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#5F6FFF] text-white px-6 py-2 rounded-full font-medium hover:bg-[#4B5BFF] disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Submit"}
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
      </div>

      {/* ===== Result Section ===== */}
      {result && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-3">
          <p>
            <span className="font-medium text-gray-700">You said:</span>{" "}
            {result.speech_to_text}
          </p>

          <p>
            <span className="font-medium text-gray-700">Assistant:</span>{" "}
            {result.doctor_response}
          </p>

          <div className="inline-block mt-2 px-4 py-1 rounded-full bg-[#EAEFFF] text-[#5F6FFF] font-medium text-sm">
            Speciality: {speciality}
          </div>
        </div>
      )}

      {/* ===== Doctors Grid ===== */}
      {filteredDoctors.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Available Specialists
          </h2>

          <div className="grid grid-cols-auto gap-4 gap-y-6">
            {filteredDoctors.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  navigate(`/appointment/${item._id}`);
                  scrollTo(0, 0);
                }}
                className="border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all bg-white"
              >
                <img
                  className="bg-[#EAEFFF]"
                  src={item.image}
                  alt={item.name}
                />
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
                    />
                    {item.available ? "Available" : "Not Available"}
                  </div>
                  <p className="text-lg font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.speciality}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Empty State ===== */}
      {speciality && filteredDoctors.length === 0 && !loading && (
        <div className="bg-white rounded-2xl shadow p-10 text-center">
          <p className="text-lg font-medium text-gray-700">
            Sorry!
          </p>
          <p className="text-gray-500 mt-2">
            We currently don’t have any experts available in this field.
          </p>
        </div>
      )}

    </div>
  </div>
);


}

