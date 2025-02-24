export function stripIndents(value: string): string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stripIndents(strings: TemplateStringsArray, ...values: any[]): string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stripIndents(arg0: string | TemplateStringsArray, ...values: any[]) {
  if (typeof arg0 !== 'string') {
    const processedString = arg0.reduce((acc, curr, i) => {
      acc += curr + (values[i] ?? '');
      return acc;
    }, '');

    return _stripIndents(processedString);
  }

  return _stripIndents(arg0);
}

function _stripIndents(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trimStart()
    .replace(/[\r\n]$/, '');
}