import { Terminal } from "~/components/Terminal";

export function meta() {
  return [
    { title: "Terminal Portfolio" },
    { name: "description", content: "Interactive developer resume" },
  ];
}

export default function Home() {
  return (
    <>
      <h1 className="sr-only">
        Terminal Portfolio — interactive developer resume
      </h1>
      <Terminal />
    </>
  );
}
