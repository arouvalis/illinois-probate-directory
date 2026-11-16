import type { Faq } from "@/lib/schema";

/**
 * Visible question-and-answer list. Pages that carry FAQ markup render the
 * same questions here, so what search engines read matches what visitors see.
 */
export default function FaqSection({
  faqs,
  heading = "Frequently Asked Questions",
  className = "",
}: {
  faqs: Faq[];
  heading?: string;
  className?: string;
}) {
  if (faqs.length === 0) return null;
  return (
    <section className={`not-prose ${className}`}>
      <h2 className="text-2xl font-serif font-bold text-navy-800 mb-5">{heading}</h2>
      <div className="space-y-4">
        {faqs.map((f) => (
          <div key={f.question} className="border border-gray-200 rounded-xl p-5 bg-white">
            <h3 className="font-serif font-bold text-navy-800 mb-2">{f.question}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{f.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
