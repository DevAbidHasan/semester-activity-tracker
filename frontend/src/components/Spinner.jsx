import { ImSpinner2 } from 'react-icons/im';

export default function Spinner({ className = '' }) {
  return <ImSpinner2 className={`h-8 w-8 animate-spin text-indigo-500 ${className}`} aria-label="Loading" />;
}
