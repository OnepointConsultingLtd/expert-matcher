export default function DialogueBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="companion-dialogue-content px-8 pt-4 pb-6">
      <section className="mt-4">
        <p className="text-xl dark:text-white">{children}</p>
      </section>
    </div>
  );
}
