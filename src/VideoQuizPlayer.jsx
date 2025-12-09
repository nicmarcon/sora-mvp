
import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

const questions = [
  {
    id: 'q1',
    timestamp: 10,
    prompt: 'Which animal is hiding behind the tree?',
    choices: ['Fox', 'Kangaroo', 'Koala'],
    correct: 'Koala',
  },
];

export default function VideoQuizPlayer() {
  const videoEl = useRef(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!videoEl.current) return;
    const player = videojs(videoEl.current, { controls: true, preload: 'auto' });

    const onTimeUpdate = () => {
      const time = player.currentTime();
      const q = questions.find((q) => time >= q.timestamp && !currentQuestion);
      if (q) {
        player.pause();
        setCurrentQuestion(q);
      }
    };

    player.on('timeupdate', onTimeUpdate);
    return () => {
      player.off('timeupdate', onTimeUpdate);
      player.dispose();
    };
  }, [currentQuestion]);

  async function recognizeSpeech() {
    const speechKey = import.meta.env.VITE_SPEECH_KEY;
    const speechRegion = import.meta.env.VITE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      setFeedback('Speech config missing. Set VITE_SPEECH_KEY and VITE_SPEECH_REGION.');
      return;
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechRecognitionLanguage = 'en-AU';
    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync((result) => {
      const spoken = (result.text || '').toLowerCase();
      const match = currentQuestion?.choices.find((c) =>
        spoken.includes(c.toLowerCase())
      );
      const isCorrect = match === currentQuestion?.correct;
      setFeedback(isCorrect ? '✅ Correct!' : '❌ Try again!');
      recognizer.close();
    });
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <video
        ref={videoEl}
        className="video-js vjs-default-skin"
        controls
        style={{ width: '100%', borderRadius: 12 }}
        // TODOrompt}</h3>
          {currentQuestion.choices.map((c) => (
            <button
              key={c}
              onClick={() =>
                setFeedback(c === currentQuestion.correct ? '✅ Correct!' : '❌ Try again!')
              }
            >
              {c}
            </button>
          ))}
          <button onClick={recognizeSpeech}>🎤 Answer by voice</button>
        </div>
      )}
      {feedback && <p>{feedback}</p>}
    </div>
  );
}
