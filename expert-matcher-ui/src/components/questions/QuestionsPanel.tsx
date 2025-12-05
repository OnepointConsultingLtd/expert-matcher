import NavigationButtons from '../NavigationButtons';
import Question from '../Question';
import Suggestions from '../Suggestions';

export default function QuestionsPanel() {
  return (
    <>
      <Question />
      <NavigationButtons />
      <Suggestions />
    </>
  );
}
