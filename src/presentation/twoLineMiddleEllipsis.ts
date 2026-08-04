export interface TwoLineMiddleEllipsisOptions {
  text: string;
  maxWidthPx: number;
  maxLines: number;
  ellipsis: string;
  font: string;
  measureTextWidth: (text: string, font: string) => number;
}

const getWrappedLineCount = ({
  text,
  maxWidthPx,
  font,
  measureTextWidth,
}: Omit<TwoLineMiddleEllipsisOptions, 'maxLines' | 'ellipsis'>): number => {
  if (text.length === 0 || maxWidthPx <= 0) {
    return 1;
  }

  const words = text.trim().split(/\s+/u);
  let lineCount = 1;
  let currentLine = '';

  const appendCharacters = (value: string): void => {
    for (const character of Array.from(value)) {
      const nextLine = `${currentLine}${character}`;

      if (
        currentLine.length > 0 &&
        measureTextWidth(nextLine, font) > maxWidthPx
      ) {
        lineCount += 1;
        currentLine = character;
      } else {
        currentLine = nextLine;
      }
    }
  };

  for (const word of words) {
    if (currentLine.length === 0) {
      if (measureTextWidth(word, font) <= maxWidthPx) {
        currentLine = word;
      } else {
        appendCharacters(word);
      }
      continue;
    }

    const nextLine = `${currentLine} ${word}`;

    if (measureTextWidth(nextLine, font) <= maxWidthPx) {
      currentLine = nextLine;
      continue;
    }

    lineCount += 1;
    currentLine = '';

    if (measureTextWidth(word, font) <= maxWidthPx) {
      currentLine = word;
    } else {
      appendCharacters(word);
    }
  }

  return lineCount;
};

const canWrapWithinLineLimit = (
  candidate: string,
  options: TwoLineMiddleEllipsisOptions,
): boolean =>
  getWrappedLineCount({
    text: candidate,
    maxWidthPx: options.maxWidthPx,
    font: options.font,
    measureTextWidth: options.measureTextWidth,
  }) <= options.maxLines;

const buildMiddleEllipsisCandidate = (
  characters: string[],
  keepCount: number,
  ellipsis: string,
): string => {
  const headCount = Math.ceil(keepCount / 2);
  const tailCount = Math.floor(keepCount / 2);

  return `${characters.slice(0, headCount).join('')}${ellipsis}${characters
    .slice(characters.length - tailCount)
    .join('')}`;
};

export const buildTwoLineMiddleEllipsisLabel = (
  options: TwoLineMiddleEllipsisOptions,
): string => {
  const normalizedText = options.text.trim().replace(/\s+/gu, ' ');

  if (
    normalizedText.length === 0 ||
    canWrapWithinLineLimit(normalizedText, options)
  ) {
    return normalizedText;
  }

  const characters = Array.from(normalizedText);
  let minimumKeepCount = 1;
  let maximumKeepCount = Math.max(1, characters.length - 1);
  let bestCandidate = `${characters[0] ?? ''}${options.ellipsis}${
    characters[characters.length - 1] ?? ''
  }`;

  while (minimumKeepCount <= maximumKeepCount) {
    const keepCount = Math.floor((minimumKeepCount + maximumKeepCount) / 2);
    const candidate = buildMiddleEllipsisCandidate(
      characters,
      keepCount,
      options.ellipsis,
    );

    if (canWrapWithinLineLimit(candidate, options)) {
      bestCandidate = candidate;
      minimumKeepCount = keepCount + 1;
    } else {
      maximumKeepCount = keepCount - 1;
    }
  }

  return bestCandidate;
};
