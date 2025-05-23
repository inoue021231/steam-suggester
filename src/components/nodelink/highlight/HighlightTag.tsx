import { CIRCLE_SIZE } from "@/constants/NETWORK_DATA";
import React from "react";

type PropsType = {
  tags: string[];
  selectedTags: string[];
  circleScale: number | undefined;
  index: number;
};

const HighlightTag: React.FC<PropsType> = React.memo(
  ({ tags, selectedTags, circleScale, index }) => {
    const isHighlight = React.useMemo(() => {
      return selectedTags.length
        ? selectedTags.every((tag) => tags.includes(tag))
        : false;
    }, [tags, selectedTags]);

    return (
      <g>
        {isHighlight && (
          <g transform={`scale(${circleScale ?? 1})`}>
            {/* グラデーション定義 */}
            <defs>
              <linearGradient
                id={`strong-gradient-${index}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ff0000" /> {/* 明るい赤 */}
                <stop offset="50%" stopColor="#ff4d4d" /> {/* 少し薄い赤 */}
                <stop offset="100%" stopColor="#ff9999" /> {/* 淡い赤 */}
              </linearGradient>
            </defs>

            {/* 内側の回転する円 */}
            <circle
              cx="0"
              cy="0"
              r={CIRCLE_SIZE}
              stroke={`url(#strong-gradient-${index})`}
              strokeWidth="3"
              fill="transparent"
              style={{
                animation: "fastRotate 1.5s linear infinite",
              }}
            />

            {/* 外側の波動のような円 */}
            <circle
              cx="0"
              cy="0"
              r={CIRCLE_SIZE}
              stroke="rgba(255, 77, 77, 0.5)"
              strokeWidth="2"
              fill="transparent"
              style={{
                animation: "waveExpand 2s ease-out infinite",
              }}
            />
          </g>
        )}
      </g>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.index === nextProps.index &&
      prevProps.circleScale === nextProps.circleScale &&
      prevProps.selectedTags.length === nextProps.selectedTags.length &&
      prevProps.selectedTags.every(
        (tag, i) => tag === nextProps.selectedTags[i]
      ) &&
      prevProps.tags.length === nextProps.tags.length &&
      prevProps.tags.every((tag, i) => tag === nextProps.tags[i])
    );
  }
);

HighlightTag.displayName = "HighlightTag";

export default HighlightTag;
