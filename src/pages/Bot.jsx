
// ------------------------------------------------------------------------------

//test botttttt

// import { useState } from "react";

// export default function ProcessInput() {
//   const [audio, setAudio] = useState(null);
//   const [image, setImage] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!audio) {
//       setError("Audio file is required");
//       return;
//     }

//     setError("");
//     setLoading(true);
//     setResult(null);

//     const formData = new FormData();
//     formData.append("audio", audio);
//     if (image) formData.append("image", image);

//     try {
//       const res = await fetch("http://192.168.14.47:5000/process", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Something went wrong");
//       }

//       setResult(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
//       <div className="bg-white w-full max-w-md rounded-xl shadow-md p-6">
//         <h2 className="text-2xl font-semibold text-gray-800 mb-4">
//           Doctor Assistant
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-600 mb-1">
//               Audio (required)
//             </label>
//             <input
//               type="file"
//               accept="audio/*"
//               onChange={(e) => setAudio(e.target.files[0])}
//               className="block w-full text-sm
//                          file:mr-4 file:py-2 file:px-4
//                          file:rounded-md file:border-0
//                          file:text-sm file:font-medium
//                          file:bg-blue-50 file:text-blue-700
//                          hover:file:bg-blue-100"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-600 mb-1">
//               Image (optional)
//             </label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => setImage(e.target.files[0])}
//               className="block w-full text-sm
//                          file:mr-4 file:py-2 file:px-4
//                          file:rounded-md file:border-0
//                          file:text-sm file:font-medium
//                          file:bg-green-50 file:text-green-700
//                          hover:file:bg-green-100"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-2 rounded-md
//                        hover:bg-blue-700 transition disabled:opacity-60"
//           >
//             {loading ? "Processing..." : "Submit"}
//           </button>
//         </form>

//         {error && (
//           <p className="mt-4 text-sm text-red-600 bg-red-50 p-2 rounded">
//             {error}
//           </p>
//         )}

//         {result && (
//           <div className="mt-6 space-y-3">
//             <div>
//               <h4 className="text-sm font-semibold text-gray-700">
//                 Speech to Text
//               </h4>
//               <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
//                 {result.speech_to_text}
//               </p>
//             </div>

//             <div>
//               <h4 className="text-sm font-semibold text-gray-700">
//                 Doctor Response
//               </h4>
//               <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
//                 {result.doctor_response}
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
