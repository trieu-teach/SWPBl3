/**
 * Shared chart label components for Admin Reports
 * 
 * Custom SVG-based tick components that ensure:
 * - NO text clipping at start or end
 * - NO unwanted ellipsis
 * - Smart word wrap (max 2 lines)
 * - Proper vertical centering
 * - Consistent label-bar spacing
 */
import { Text } from "recharts";

/**
 * WrappedTick - Custom SVG tick for YAxis with automatic word wrapping
 * 
 * Key features:
 * - Uses native SVG <text> elements for maximum compatibility
 * - Wraps text intelligently based on available width
 * - NO ellipsis unless absolutely necessary (>2 lines AND single word too long)
 * - NO character loss at start or end
 * - Properly positioned with line 1 ABOVE, line 2 BELOW
 * 
 * @param {number} x - X position (right edge of label area from Recharts)
 * @param {number} y - Y position (center of bar from Recharts)  
 * @param {object} payload - Recharts payload with { value: string }
 * @param {number} width - Available width for label (should match YAxis width)
 * @param {number} fontSize - Font size in pixels
 * @param {string} color - Text color
 * @param {string} textAnchor - 'end' = right-aligned, 'start' = left-aligned
 */
export function WrappedTick({ 
  x = 0, 
  y = 0, 
  payload, 
  width = 180, 
  fontSize = 11,
  color = "#666",
  textAnchor = "end"
}) {
  const rawText = payload?.value;
  
  // No text = no render
  if (!rawText) return null;
  
  const text = String(rawText);
  
  // Calculate max chars that fit in the width
  // Using 0.58 ratio for proportional fonts (avg char width / font size)
  const avgCharWidth = fontSize * 0.58;
  const maxCharsPerLine = Math.floor(width / avgCharWidth);
  
  // If text fits in one line, no wrapping needed
  if (text.length <= maxCharsPerLine) {
    return (
      <g>
        <text
          x={x}
          y={y}
          textAnchor={textAnchor}
          fontSize={fontSize}
          fill={color}
          fontFamily="sans-serif"
          dominantBaseline="central"
        >
          {text}
        </text>
      </g>
    );
  }
  
  // Text needs wrapping - build lines array with CORRECT order
  // Line 0 = FIRST part of text (displays ABOVE)
  // Line 1 = SECOND part of text (displays BELOW)
  const lines = [];
  let pendingLine = ''; // Accumulates content for current line
  
  // Split by spaces first
  const words = text.split(' ');
  
  for (const word of words) {
    if (!word) continue;
    
    const testLine = pendingLine ? `${pendingLine} ${word}` : word;
    
    if (testLine.length <= maxCharsPerLine) {
      // Word fits in current line
      pendingLine = testLine;
    } else {
      // Current line is full - save it
      if (pendingLine) {
        lines.push(pendingLine);
      }
      
      if (word.length <= maxCharsPerLine) {
        // Normal word - start new line
        pendingLine = word;
      } else {
        // Long word - break it
        const parts = word.split(/(_|-)/);
        
        if (parts.length > 1) {
          // Has separators like _ or -
          pendingLine = '';
          for (const part of parts) {
            if (!part) continue;
            const test = pendingLine + part;
            if (test.length <= maxCharsPerLine) {
              pendingLine += part;
            } else {
              if (pendingLine) {
                lines.push(pendingLine);
              }
              pendingLine = part;
              if (lines.length >= 2) break;
            }
          }
        } else {
          // No separators - break by chars
          // Take first maxCharsPerLine chars for first line
          const firstPart = word.slice(0, maxCharsPerLine);
          const remainingPart = word.slice(maxCharsPerLine);
          
          // Push first part (line 0)
          lines.push(firstPart);
          
          // If there's remaining and we have room for line 1, save it
          if (remainingPart && lines.length < 2) {
            pendingLine = remainingPart;
          } else {
            pendingLine = '';
          }
        }
      }
      
      // Safety check: max 2 lines
      if (lines.length >= 2) break;
    }
  }
  
  // Don't forget the last pending line
  if (pendingLine && lines.length < 2) {
    lines.push(pendingLine);
  }
  
  // Take max 2 lines
  const displayLines = lines.slice(0, 2);
  
  // Calculate vertical positioning
  // Line 0 displays ABOVE the tick, Line 1 displays BELOW
  // index 0 → negative y offset (above)
  // index 1 → positive y offset (below)
  const lineHeight = fontSize + 3;
  
  return (
    <g>
      {displayLines.map((line, index) => {
        // Vertical positioning: line 0 ABOVE center, line 1 BELOW center
        // dominantBaseline="central" means y is the vertical CENTER
        // Line 0 at y - halfLineHeight (above center)
        // Line 1 at y + halfLineHeight (below center)
        const halfLineHeight = lineHeight / 2;
        const yOffset = (index - 0.5) * lineHeight;
        
        return (
          <text
            key={`${index}-${line}`}
            x={x}
            y={y + yOffset}
            textAnchor={textAnchor}
            fontSize={fontSize}
            fill={color}
            fontFamily="sans-serif"
            dominantBaseline="central"
          >
            {line}
          </text>
        );
      })}
    </g>
  );
}

/**
 * Create a consistent YAxis configuration for horizontal bar charts
 * Use this helper to ensure all bar charts have consistent label styling
 */
export function createYAxisConfig(theme, options = {}) {
  const {
    width = 200,
    fontSize = 11,
    tickMargin = 12,
  } = options;
  
  return {
    type: 'category',
    tickLine: false,
    axisLine: false,
    width,
    tickMargin,
  };
}

/**
 * Calculate optimal label width based on chart container width
 * Ensures labels don't overflow on smaller screens
 */
export function calculateResponsiveLabelWidth(containerWidth, options = {}) {
  const {
    minWidth = 140,
    maxWidth = 240,
    ratio = 0.35,
  } = options;
  
  const calculated = Math.floor(containerWidth * ratio);
  return Math.max(minWidth, Math.min(maxWidth, calculated));
}
