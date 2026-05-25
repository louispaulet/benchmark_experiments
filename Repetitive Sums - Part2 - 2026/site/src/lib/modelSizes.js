const CLOSED_MODEL_SIZE_ESTIMATES = {
  "gpt-5.5": { billions: 2200, label: "~2.2T", note: "Estimated frontier closed-model parameter count" },
  "gpt-5.4": { billions: 1800, label: "~1.8T", note: "Estimated frontier closed-model parameter count" },
  "gpt-5.4-mini": { billions: 120, label: "~120B", note: "Estimated mini frontier closed-model parameter count" },
  "claude-3-opus-20240229": { billions: 2000, label: "~2T", note: "Estimated closed-model parameter count" },
  "claude-3-sonnet-20240229": { billions: 400, label: "~400B", note: "Estimated closed-model parameter count" },
  "claude-3-haiku-20240307": { billions: 20, label: "~20B", note: "Estimated closed-model parameter count" },
  "gpt-4o-2024-05-13": { billions: 200, label: "~200B", note: "Estimated closed-model parameter count" },
  "gpt-4-0125-preview": { billions: 1800, label: "~1.8T", note: "Estimated closed-model parameter count" },
  "gpt-4-turbo-2024-04-09": { billions: 1800, label: "~1.8T", note: "Estimated closed-model parameter count" },
  "gpt-4-1106-preview": { billions: 1800, label: "~1.8T", note: "Estimated closed-model parameter count" },
  "gpt-4-0613": { billions: 1800, label: "~1.8T", note: "Estimated closed-model parameter count" },
  "gpt-3.5-turbo-0125": { billions: 175, label: "~175B", note: "Estimated closed-model parameter count" },
  "gpt-3.5-turbo-1106": { billions: 175, label: "~175B", note: "Estimated closed-model parameter count" },
  "gemini-1.5-pro": { billions: 1500, label: "~1.5T", note: "Estimated closed-model parameter count" },
  "gemini-1.5-flash": { billions: 100, label: "~100B", note: "Estimated closed-model parameter count" },
  "gemini-1.0-pro": { billions: 175, label: "~175B", note: "Estimated closed-model parameter count" },
};

function formatBillions(value) {
  if (value >= 1000) return `${Number((value / 1000).toFixed(1))}T`;
  return `${Number(value.toFixed(1))}B`;
}

function parsedSizeFromName(modelName) {
  const mixture = modelName.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*b/i);
  if (mixture) {
    const experts = Number(mixture[1]);
    const expertSize = Number(mixture[2]);
    const billions = experts * expertSize;
    return {
      billions,
      label: `${formatBillions(billions)} (${experts}x${formatBillions(expertSize)})`,
      note: "Parsed total expert parameter count from model name",
    };
  }

  const dense = modelName.match(/(\d+(?:\.\d+)?)\s*b\b/i);
  if (dense) {
    const billions = Number(dense[1]);
    return {
      billions,
      label: formatBillions(billions),
      note: "Parsed parameter count from model name",
    };
  }

  return null;
}

export function getModelSize(modelName) {
  return parsedSizeFromName(modelName) ?? CLOSED_MODEL_SIZE_ESTIMATES[modelName] ?? {
    billions: null,
    label: "n/a",
    note: "No model size estimate available",
  };
}

export function withModelSize(row) {
  const size = getModelSize(row.model_name);
  return {
    ...row,
    model_size_b: size.billions,
    model_size_label: size.label,
    model_size_note: size.note,
  };
}

export function compareModelSizeDesc(a, b) {
  const left = b.model_size_b ?? -Infinity;
  const right = a.model_size_b ?? -Infinity;
  if (left !== right) return left - right;
  return a.model_name.localeCompare(b.model_name);
}
