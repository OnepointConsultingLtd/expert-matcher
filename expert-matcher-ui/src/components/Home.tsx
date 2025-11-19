import { useDarkMode } from '../hooks/useDarkMode';
import Main from './Main';


export default function Home() {
  useDarkMode();
  return <Main />;
}
