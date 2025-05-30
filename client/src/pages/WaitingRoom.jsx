import { useState, useEffect } from "react";
import socketService from "../services/socketService";
import { useLocation, useNavigate } from "react-router-dom";

export default function WaitingRoom() {
  const [hostStatus, setHostStatus] = useState("offline");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = location.state || { username: "Guest" };

  useEffect(() => {
    socketService.registerHandlers({
      gameStarted: (data) => {
        setHostStatus("starting");
        setMessage("Game is starting...");

        // Request updated room details to get latest gameInProgress status
        socketService.requestRoomDetails();
      },

      kicked: (data) => {
        // check if the user is kicked
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          alert("You have been kicked from the game. Reason: " + data.reason);
          socketService.disconnect();
          localStorage.removeItem("user");
          window.location.href = "/";
        } else {
          alert("You have been logged out. Please log in again.");
          localStorage.removeItem("user");
          window.location.href = "/";
        }
      },

      error: (error) => {
        if (error.message && error.message.includes("waiting for host")) {
          setHostStatus("offline");
          setMessage("Waiting for host to join...");
        }
      },
    });

    return () => {
      // Restore original handlers instead of clearing all
      socketService.clearHandlers();
    };
  }, []);

  // Countdown effect for UI feedback when game is starting
  useEffect(() => {
    if (hostStatus === "starting") {
      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            navigate("/game");
            clearInterval(countdownTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(countdownTimer);
      };
    }
  }, [hostStatus, navigate]);

  const onBack = () => {
    socketService.disconnect();
    localStorage.removeItem("user");
    // Navigate back to login page
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Waiting for game to start</h1>

        <div className="mb-6">
          <div
            className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center
            ${
              hostStatus === "offline"
                ? "bg-red-500"
                : hostStatus === "online"
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
          >
            <span className="text-3xl font-bold text-gray-900">H</span>
          </div>

          <p className="mb-4">
            Welcome <span className="font-bold">{username}</span>!
          </p>

          <p className="text-gray-400">
            {hostStatus === "starting"
              ? `Game starting in ${countdown} seconds...`
              : message || "Waiting for the host..."}
          </p>
        </div>

        <div className="mb-6">
          {hostStatus === "offline" && (
            <div className="animate-pulse flex justify-center mb-4">
              <div className="h-3 w-3 bg-blue-600 rounded-full mx-1"></div>
              <div className="h-3 w-3 bg-blue-600 rounded-full mx-1 animation-delay-200"></div>
              <div className="h-3 w-3 bg-blue-600 rounded-full mx-1 animation-delay-400"></div>
            </div>
          )}

          {hostStatus === "online" && (
            <div className="animate-pulse flex justify-center mb-4">
              <div className="h-3 w-3 bg-green-600 rounded-full mx-1"></div>
              <div className="h-3 w-3 bg-green-600 rounded-full mx-1 animation-delay-200"></div>
              <div className="h-3 w-3 bg-green-600 rounded-full mx-1 animation-delay-400"></div>
            </div>
          )}

          {hostStatus === "starting" && (
            <div className="flex justify-center mb-4">
              <div className="h-3 w-24 bg-green-600 rounded-full mx-1 animate-pulse"></div>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={onBack}
            className={`px-4 py-2 ${
              hostStatus === "starting"
                ? "bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700"
                : "bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
            }`}
          >
            Back to Login
          </button>
        </div>
      </div>
    </main>
  );
}
