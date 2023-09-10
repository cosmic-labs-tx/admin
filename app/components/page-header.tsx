type Props = {
  title: string;
  children?: React.ReactNode;
};

export function PageHeader(props: Props) {
  return (
    <header className="mb-12 flex w-full items-center justify-between">
      <h1 className="text-4xl font-black">{props.title}</h1>
      {props.children}
    </header>
  );
}
