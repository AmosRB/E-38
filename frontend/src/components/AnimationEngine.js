export default function runAnimationEngine(gameState) {
  // ביטול הרנדומליות שגרמה לקפיצות במפה
  // אם תרצה להפעיל שוב, פשוט תסיר את ה־if או תשנה ל־true

  if (false) {
    gameState.aliens.forEach(a => {
      a.lat += (Math.random() - 0.5) * 0.0001;
      a.lng += (Math.random() - 0.5) * 0.0001;
    });
  }

  // future animation logic can go here
}
