import { storage } from './storage';
import { generateStandaloneHtml } from './standaloneHtmlGenerator';
import { sound } from './audio';
import confetti from 'canvas-confetti';

export async function downloadStandaloneIndexHtml() {
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

  let htmlContent = '';
  try {
    const res = await fetch('/app-singlefile.html');
    if (res.ok) {
      const fetchedText = await res.text();
      if (fetchedText && fetchedText.includes('<!doctype html>') || fetchedText.includes('<!DOCTYPE html>')) {
        htmlContent = fetchedText;
      }
    }
  } catch (e) {
    console.warn('Could not fetch app-singlefile.html directly, using dynamic generator', e);
  }

  // Fallback to dynamic self-contained HTML generator if static bundle is not fetched
  if (!htmlContent) {
    const state = {
      userProfile: storage.getUserProfile(),
      subjects: storage.getSubjects(),
      months: storage.getMonths(),
      schedule: storage.getSchedule(),
      pomodoroStats: storage.getPomodoroStats(),
      settings: storage.getSettings(),
      todos: storage.getTodos(),
      workspaceItems: storage.getWorkspaceItems(),
    };
    htmlContent = generateStandaloneHtml(state);
  }

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
  }, 300);
}
