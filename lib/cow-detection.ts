const COW_LABELS = [
  "cattle",
  "cow",
  "bovine",
  "livestock",
  "dairy cow",
  "bull",
  "calf",
  "ox",
  "dairy cattle",
  "herd",
  "water buffalo",
  "steer",
  "heifer",
];

const CONFIDENCE_THRESHOLD = 0.7;

export interface CowDetectionResult {
  isCow: boolean;
  confidence: number;
  matchedLabel: string | null;
}

export async function detectCow(
  imageBase64: string,
): Promise<CowDetectionResult> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

  if (!apiKey) {
    console.warn(
      "GOOGLE_CLOUD_VISION_API_KEY not set — skipping cow detection",
    );
    return { isCow: true, confidence: 1, matchedLabel: "skipped" };
  }

  // Strip data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Data },
            features: [{ type: "LABEL_DETECTION", maxResults: 20 }],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      "Google Vision API error:",
      response.status,
      response.statusText,
      errorBody,
    );
    throw new Error(
      `Google Vision API returned ${response.status}: ${errorBody}`,
    );
  }

  const data = await response.json();
  const labels = data.responses?.[0]?.labelAnnotations ?? [];

  for (const label of labels) {
    const desc = label.description.toLowerCase();
    if (
      COW_LABELS.some((cowTerm) => desc.includes(cowTerm)) &&
      label.score >= CONFIDENCE_THRESHOLD
    ) {
      return {
        isCow: true,
        confidence: label.score,
        matchedLabel: label.description,
      };
    }
  }

  return { isCow: false, confidence: 0, matchedLabel: null };
}
