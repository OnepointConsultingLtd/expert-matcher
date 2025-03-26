import Header from './Header';
import Body from './Body';
import RestartDialogue from './dialogue/RestartDialogue';
import MarkdownOverlay from './MarkdownOverlay';

export default function Main() {
  return (
    <>
      <RestartDialogue />
      <MarkdownOverlay />
      <Header />
      <Body />
    </>
  );
}
