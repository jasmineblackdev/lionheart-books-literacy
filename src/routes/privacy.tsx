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
      <p>We never sell your information. This website has no customer accounts.</p>
      <h2 className="pt-4 text-2xl font-semibold">Children's privacy</h2>
      <p>
        This site is intended for parents, teachers and caregivers. We do not knowingly collect
        personal information from children under 13. If you are under 13, please ask a grown-up to
        send a suggestion for you.
      </p>
      <h2 className="pt-4 text-2xl font-semibold">Book suggestions</h2>
      <p>When you suggest a book, we store the category, audience and idea you choose so we can evaluate future publishing ideas. Your email is optional; if you give one, we use it only to follow up on your idea.</p>
      <p>We send book-release update emails only if you separately tick the release-updates box. Submitting a suggestion never subscribes you automatically, and you can ask us to unsubscribe you or delete your suggestion at any time by email.</p>
      <p>To stop spam we keep a one-way scrambled version of your network address for a short rate limit. We can't read your actual address from it.</p>
      <h2 className="pt-4 text-2xl font-semibold">Class-set inquiries</h2>
      <p>The class-set inquiry form does not send data to our servers. It opens your own email app with your details filled in, and you choose whether to send it.</p>
      <p>"Buy on Amazon" links take you to Amazon, which has its own privacy policy.</p>
       <p>Digital purchases are processed by Payhip; their privacy policy applies to checkout.</p>
      <p>Questions? Email <a href={`mailto:${EMAIL}`} className="font-bold underline">{EMAIL}</a>.</p>
    </section>
  );
}
