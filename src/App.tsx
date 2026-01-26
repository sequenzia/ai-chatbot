import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ChatPage } from '@/pages/ChatPage';

export function App() {
  return (
    <ThemeProvider>
      <ChatPage />
    </ThemeProvider>
  );
}
