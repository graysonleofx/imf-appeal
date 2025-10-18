import { MainSection as LegacyMain } from "./main-section";

// Simple wrapper re-export so we preserve all existing logic in components/main-section.jsx
export default function MainSection() {
  return <LegacyMain />;
}