import { IoCloseOutline } from 'react-icons/io5';

/**
 * Used for dialogue headers.
 * @param children Typically some image which goes on the left side
 * @param onClose The function to call when the close icon is clicked.
 * @param className The optional class name.
 * @constructor
 */
export default function DialogueHeader({
  children,
  onClose,
  className = '',
}: {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}) {
  return (
    <section className={`flex flex-row justify-between pl-8 pr-6 pt-8 ${className}`}>
      {children}
      <IoCloseOutline className="close-icon" onClick={onClose} />
    </section>
  );
}
