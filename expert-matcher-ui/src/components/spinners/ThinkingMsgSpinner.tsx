import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

const ThinkingMsgSpinner = ({ className = `h-20 w-20` }) => {
  const { t } = useTranslation();

  const messages = [
  'Please wait',
  'Thinking',
  'Connecting to our AI engine',
  'Analyzing your answers',
  'Generating custom questions',
  'Almost ready',
];


  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [key, setKey] = useState(0);

  useEffect(() => {
  if (index === messages.length - 1) return; 
  const interval = setInterval(() => {
    setIsVisible(false);

    // setTimeout(() => {
      setIndex((i) => {
        const next = i + 1;

        // If next is last index, stop increasing further
        if (next >= messages.length - 1) {
          return messages.length - 1;
        }

        return next;
      });

      setKey((k) => k + 1);
      setIsVisible(true);
    // }, 300);
  }, 1800);

  return () => clearInterval(interval);
}, [index]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t(messages[index])}
      className="flex flex-col items-center justify-center gap-4 py-8"
    >
      {/* SIMPLE Loader */}
      <div className="relative flex items-center justify-center">
        <img
          src="/images/D-Well_Icons_one_frame.gif"
          alt={t('Please wait')}
          className={`${className} relative z-10`}
        />
      </div>

      {/* Smooth message */}
      <div className="relative  flex items-center justify-center min-h-[32px]">
        <div
          key={key}
          className={`
             flex items-center justify-center gap-2
            transition-all duration-500 w-full
            ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-2'
            }
            
          `}
        >
          <span className="text-base  font-medium text-gray-800 dark:text-gray-100">
            {t(messages[index])}
          </span>

          {/* Dots */}
          <span className="inline-flex items-center justify-center gap-1 mt-1 ">
            <span className="w-1.5 h-1.5 bg-[#9A19FF] rounded-full animate-bounce" />
            <span
              className="w-1.5 h-1.5 bg-[#9A19FF] rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-1.5 h-1.5 bg-[#9A19FF] rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </span>
        </div>
      </div>

      {/* Clean indicator dots */}
      <div className="flex gap-1.5 mt-2 justify-center items-center">
        {messages.map((_, i) => (
          <div
            key={i}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${
                i === index
                  ? 'bg-[#9A19FF] scale-110'
                  : 'bg-gray-300 dark:bg-gray-600'
              }
            `}
          />
        ))}
      </div>
    </div>
  );
};

export default ThinkingMsgSpinner;
