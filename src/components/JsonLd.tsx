// Inline JSON-LD via dangerouslySetInnerHTML — Next.js' recommended pattern
// for structured data because <script type="application/ld+json"> must keep
// its raw JSON contents without React-style escaping.

interface Props {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
