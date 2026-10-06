import { storage } from './storage';
import { generateStandaloneHtml } from './standaloneHtmlGenerator';
import { sound } from './audio';
import confetti from 'canvas-confetti';

export function downloadStandaloneIndexHtml() {
  sound.playSuccess();
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  } catch (e) {
    // ignore if canvas-confetti fails
  }

  // Gather complete current application state
  const state = {
    userProfile: storage.getUserProfile(),
    subjects: storage.getSubjects(),
    months: storage.getMonths(),
    schedule: storage.getSchedule(),
    pomodoroStats: storage.getPomodoroStats(),
    settings: storage.getSettings(),
  };

  const htmlContent = generateStandaloneHtml(state);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'index.html'; // Specifically index.html as requested by the user
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 200);
}
