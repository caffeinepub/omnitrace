// Context snapshot provider for instrumentation

let currentScreen = 'timeline';
let currentMode = 'default';

export function setCurrentScreen(screen: string): void {
  currentScreen = screen;
}

export function setCurrentMode(mode: string): void {
  currentMode = mode;
}

export function getCurrentContext(): { screen: string; mode: string } {
  return { screen: currentScreen, mode: currentMode };
}
