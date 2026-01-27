import Header from './Header';
import Body from './Body';
import RestartDialogue from './dialogue/RestartDialogue';
import MarkdownOverlay from './MarkdownOverlay';
import Disclaimer from './Disclaimer';

export default function Main() {
  return (
    <div className="flex flex-col flex-grow w-full">
      <RestartDialogue />
      <MarkdownOverlay />
      <Header />
      <Body />
      <Disclaimer />
    </div>
  );
}
