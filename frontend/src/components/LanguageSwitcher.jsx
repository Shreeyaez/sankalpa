import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher({ className = "" }) {
  const { i18n } = useTranslation();
  const isNepali = i18n.language === "ne";

  return (
    <button
      onClick={() => i18n.changeLanguage(isNepali ? "en" : "ne")}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium
        transition-colors duration-200
        ${isNepali
          ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        } ${className}`}
    >
      <span>{isNepali ? "🇬🇧 English" : "🇳🇵 नेपाली"}</span>
    </button>
  );
}