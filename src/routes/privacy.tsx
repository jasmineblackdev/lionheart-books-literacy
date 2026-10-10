import { createFileRoute } from "@tanstack/react-router";
import { EMAIL, pageHead } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead({
      title: "Privacy Policy | J. B. Lionheart Books",
      description: "How the J. B. Lionheart Books website handles your information.",
      path: "/privacy",
    }),
  component: Privacy,
});

function Privacy() {
  return (
    <section className="mx-auto max-w-3xl space-y-4 px-5 py-14">
      <h1 className="text-4xl font-bold">Privacy policy</h1>
      <p>This website does not use accounts, store personal data or sell information.</p>
      <p>The class-set inquiry form does not send data to our servers. It opens your own email app with your details filled in, and you choose whether to send it.</p>
      <p>"Buy on Amazon" links take you to Amazon, which has its own privacy policy.</p>
      <p>Questions? Email <a href={`mailto:${EMAIL}`} className="font-bold underline">{EMAIL}</a>.</p>
    </section>
  );
}
