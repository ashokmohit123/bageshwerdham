import React, { useState, useRef, useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaUndoAlt,
  FaRedoAlt,
} from "react-icons/fa";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Utility: format seconds to mm:ss
const formatTime = (time) => {
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const PodcastSection = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [podcastData, setPodcastData] = useState({
    title: "The Bageshwar Dham Sarakar Podcast",
    exploreLink: "#",
    playlist: [],
  });

  // Fetch data from API
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectpodcastplaylist`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        const data = res.data || [];
        setPodcastData((prev) => ({
          ...prev,
          playlist: data,
        }));
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
      });
  }, []);

  const selectedPodcast = podcastData.playlist[currentIndex] || {};

  // Load new podcast & resume time WITHOUT autoplay on page load
  useEffect(() => {
    if (!selectedPodcast.id) return;

    const saved = localStorage.getItem(`resume-${selectedPodcast.id}`);
    setCurrentTime(saved ? parseFloat(saved) : 0);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      audioRef.current.currentTime = saved ? parseFloat(saved) : 0;

      // DO NOT autoplay here on page load
      setIsPlaying(false);
    }
  }, [selectedPodcast.id]);

  // Save resume position
  useEffect(() => {
    if (selectedPodcast.id) {
      localStorage.setItem(`resume-${selectedPodcast.id}`, currentTime);
    }
  }, [currentTime, selectedPodcast.id]);

  // Sync current time
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn("Playback blocked:", err));
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const goToPrevious = () => {
    if (!podcastData.playlist.length) return;
    const newIndex =
      (currentIndex - 1 + podcastData.playlist.length) % podcastData.playlist.length;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    if (!podcastData.playlist.length) return;
    const newIndex = (currentIndex + 1) % podcastData.playlist.length;
    setCurrentIndex(newIndex);
  };

  // Select & auto play podcast ON CLICK only
  const handlePodcastSelect = (index) => {
    setCurrentIndex(index);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.warn("Autoplay blocked:", err));
      }
    }, 100);
  };

  return (
    <section
      className="podcost-section wrapper2 mt-5"
      style={{ maxWidth: "1600px", padding: "40px 20px" }}
    >
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
        <h1 className="fw-bold mb-0 text-dark">🎧 {podcastData.title}</h1>
        <a
          href={podcastData.exploreLink}
          className="text-decoration-none small"
          style={{ fontSize: "18px", fontWeight: 600, color: "gray" }}
        >
          Explore all events &gt;
        </a>
      </div>

      <div className="row bg-light py-5">
        {/* Player */}
        <div className="col-md-6 d-flex justify-content-center align-items-center p-4">
          {selectedPodcast?.id ? (
            <div
              className="bg-white p-4 rounded-4 shadow"
              style={{ maxWidth: "400px", width: "100%" }}
            >
              <div
                className="position-relative mb-3"
                style={{
                  height: "256px",
                  width: "256px",
                  margin: "0 auto",
                }}
              >
                <img
                  src={`${BASE_URL}${selectedPodcast.image}`}
                  className="img-fluid rounded-4 shadow w-100 h-100 object-cover"
                  alt={selectedPodcast.title}
                />
              </div>

              <div className="text-center mb-2">
                <small className="text-muted d-block">
                  {selectedPodcast.category} • {selectedPodcast.date}
                </small>
                <h5 className="fw-bold mt-2">{selectedPodcast.title}</h5>
              </div>

              <audio
                ref={audioRef}
                controls
                hidden
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
              >
                <source src={selectedPodcast.audio} type="audio/mp3" />
              </audio>

              <div className="mb-2">
                <input
                  type="range"
                  className="form-range"
                  min={0}
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                />
                <div
                  className="d-flex justify-content-between text-muted"
                  style={{ fontSize: "13px" }}
                >
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
                <button
                  className="btn btn-light btn-sm rounded-circle"
                  title="Previous"
                  onClick={goToPrevious}
                >
                  <FaStepBackward className="text-muted" />
                </button>
                <button
                  className="btn btn-light btn-sm rounded-circle"
                  title="Rewind"
                >
                  <FaUndoAlt className="text-muted" />
                </button>
                <button
                  className="btn btn-dark btn-lg rounded-circle"
                  style={{ width: "64px", height: "64px" }}
                  title={isPlaying ? "Pause" : "Play"}
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <FaPause className="text-white fs-4" />
                  ) : (
                    <FaPlay className="text-white fs-4" />
                  )}
                </button>
                <button
                  className="btn btn-light btn-sm rounded-circle"
                  title="Forward"
                >
                  <FaRedoAlt className="text-muted" />
                </button>
                <button
                  className="btn btn-light btn-sm rounded-circle"
                  title="Next"
                  onClick={goToNext}
                >
                  <FaStepForward className="text-muted" />
                </button>
              </div>
            </div>
          ) : (
            <p>Loading podcast...</p>
          )}
        </div>

        {/* Playlist */}
        <div className="col-md-6 p-4">
          <ul className="list-unstyled">
            {podcastData.playlist.map((item, index) => (
              <li
                key={item.id}
                onClick={() => handlePodcastSelect(index)}
                className={`d-flex align-items-center gap-3 mb-3 p-2 bg-white rounded shadow-sm ${
                  selectedPodcast.title === item.title ? "border border-primary" : ""
                }`}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={`${BASE_URL}${item.image}`}
                  className="rounded"
                  width="60"
                  height="60"
                  alt={item.title}
                />
                <div className="flex-grow-1">
                  <div className="fw-semibold text-dark">{item.title}</div>
                  <small className="text-muted">
                    {item.category} • {item.duration}
                  </small>
                </div>
                <button
                  className="listenbutton btn btn-sm d-flex align-items-center gap-2 px-3 rounded-pill"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePodcastSelect(index);
                  }}
                >
                  <span>Listen</span>
                  <FaPlay />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default PodcastSection;
