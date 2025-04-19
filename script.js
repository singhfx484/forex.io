
const sentences = [
  "How are you today?",
  "What is your name?",
  "Can you speak English?",
  "Practice makes perfect.",
  "I love learning new things."
];
let currentSentence = "";
let recognition;
let userSpeech = "";
let recordedAudio = null;
let correctCount = 0;
let totalAttempts = 0;

function newSentence() {
  const randomIndex = Math.floor(Math.random() * sentences.length);
  currentSentence = sentences[randomIndex];
  document.getElementById("sentence").textContent = currentSentence;
  document.getElementById("result").textContent = "";
}

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z\s]/g, '').trim();
}

function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];
    mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
      recordedAudio = new Audio(URL.createObjectURL(audioBlob));
    };
    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 3000);
  });

  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.start();
  recognition.onresult = event => {
    userSpeech = event.results[0][0].transcript;
    const userNorm = normalize(userSpeech);
    const sentenceNorm = normalize(currentSentence);
    const match = sentenceNorm.includes(userNorm) || userNorm.includes(sentenceNorm);
    totalAttempts++;
    if (match) correctCount++;
    updateChart();
    document.getElementById("result").textContent = match
      ? `✅ Good job!\nYou said: "${userSpeech}"`
      : `❌ Try again.\nYou said: "${userSpeech}"`;
  };
}

function playBack() {
  if (recordedAudio) recordedAudio.play();
  else alert("No recording available. Please record first.");
}

function startTimer() {
  let timeLeft = 30;
  const timerEl = document.getElementById("timer");
  const interval = setInterval(() => {
    timerEl.textContent = "Time left: " + timeLeft + "s";
    timeLeft--;
    if (timeLeft < 0) {
      clearInterval(interval);
      timerEl.textContent = "⏰ Time's up!";
    }
  }, 1000);
}

const ctx = document.getElementById('chart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Correct', 'Incorrect'],
    datasets: [{
      label: 'Performance',
      data: [0, 0],
      backgroundColor: ['#28a745', '#dc3545']
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }
});

function updateChart() {
  chart.data.datasets[0].data = [correctCount, totalAttempts - correctCount];
  chart.update();
}
