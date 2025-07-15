// This file has been replaced by EnhancedVoiceRecorder.tsx
// Keeping this as a placeholder to avoid breaking imports
// All functionality has been moved to the enhanced version

import { EnhancedVoiceRecorder } from "./EnhancedVoiceRecorder";

interface VoiceRecorderProps {
  onSuccess: () => void;
}

export function VoiceRecorder({ onSuccess }: VoiceRecorderProps) {
  return <EnhancedVoiceRecorder onSuccess={onSuccess} mode="standalone" />;
}
