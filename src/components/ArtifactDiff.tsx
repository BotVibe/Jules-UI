import { useMemo } from 'react';

interface ArtifactDiffProps {
  diff: string;
  filename?: string;
}

export const ArtifactDiff = ({ diff, filename }: ArtifactDiffProps) => {
  // Parse simple unified diff if needed, or pass directly.
  // react-diff-viewer usually takes oldValue and newValue.
  // If we only have a unified patch string from the API, we can either parse it manually
  // or use a simpler renderer. Since we have to display unified diffs, let's write a simple parser/renderer
  // optimized for mobile instead of relying fully on react-diff-viewer which might struggle with raw patch string without old/new split.

  const lines = useMemo(() => {
    return diff.split('\n');
  }, [diff]);

  return (
    <div className="rounded border border-gray-200 overflow-hidden my-2 text-xs">
      {filename && (
        <div className="bg-gray-100 p-2 font-mono text-gray-700 font-semibold border-b border-gray-200 truncate">
          {filename}
        </div>
      )}
      <div className="overflow-x-auto bg-gray-50 max-h-64 overflow-y-auto w-full max-w-full">
        <table className="w-full text-left border-collapse">
          <tbody>
            {lines.map((line, i) => {
              let bg = 'bg-transparent';
              let text = 'text-gray-800';
              if (line.startsWith('+') && !line.startsWith('+++')) {
                bg = 'bg-green-100';
                text = 'text-green-900';
              } else if (line.startsWith('-') && !line.startsWith('---')) {
                bg = 'bg-red-100';
                text = 'text-red-900';
              } else if (line.startsWith('@@')) {
                bg = 'bg-blue-50';
                text = 'text-blue-500';
              }

              return (
                <tr key={i} className={bg}>
                  <td className="w-8 text-right pr-2 select-none text-gray-400 font-mono bg-gray-100 border-r border-gray-200">
                    {i + 1}
                  </td>
                  <td className={`pl-2 font-mono whitespace-pre-wrap break-all ${text}`}>
                    {line}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
