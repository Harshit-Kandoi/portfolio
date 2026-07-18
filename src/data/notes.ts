import { Note } from '../services/supabase';

export const NOTES_SEED: Note[] = [
  {
    id: '1',
    title: 'Getting Started with Google Cloud Functions (Gen 2)',
    content: `# Cloud Functions Gen 2 — Key Differences

Google Cloud Functions Gen 2 is built on **Cloud Run** under the hood, giving you far more flexibility.

## What Changed
- **Longer execution time**: Up to 60 minutes (vs 9 min for Gen 1)
- **More memory**: Up to 32GB RAM
- **Concurrency**: Handle multiple requests per instance
- **Event-driven**: Native Eventarc integration

## Quick Deploy Example
\`\`\`bash
gcloud functions deploy my-function \\
  --gen2 \\
  --runtime python311 \\
  --trigger-http \\
  --allow-unauthenticated
\`\`\`

## Pub/Sub Trigger Pattern
\`\`\`python
import functions_framework

@functions_framework.cloud_event
def handle_pubsub(cloud_event):
    data = cloud_event.data["message"]["data"]
    print(f"Received: {data}")
\`\`\`

> **Tip**: Always set \`--min-instances 1\` in production to avoid cold starts on critical paths.`,
    tags: ['GCP', 'Cloud', 'Python', 'Serverless'],
    date: '2025-09-15',
    read_time_mins: 4,
    is_featured: true,
  },
  {
    id: '2',
    title: 'Docker Multi-Stage Builds — Shrink Your Images by 90%',
    content: `# Docker Multi-Stage Builds

Multi-stage builds let you use multiple \`FROM\` statements in a single Dockerfile, copying only what you need to the final image.

## The Problem
A typical Python AI app with PyTorch can easily be **4GB+**. Nobody wants to pull that.

## The Solution
\`\`\`dockerfile
# Stage 1: Builder
FROM python:3.11 AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Stage 2: Runtime (slim!)
FROM python:3.11-slim AS runtime
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY src/ .
CMD ["python", "main.py"]
\`\`\`

## Results
| Build | Size |
|-------|------|
| Single stage | 4.2 GB |
| Multi-stage | 380 MB |

That's a **91% reduction** in image size. Faster pulls, faster CI/CD, happier infra.`,
    tags: ['Docker', 'DevOps', 'Performance'],
    date: '2025-08-20',
    read_time_mins: 5,
    is_featured: true,
  },
  {
    id: '3',
    title: 'YOLO Object Detection — From Training to Production',
    content: `# YOLOv5/YOLOv8 Production Pipeline

I used YOLO for plastic waste classification at Anantagni and ASL sign detection in my projects. Here's what I learned.

## Dataset Preparation
\`\`\`bash
# Folder structure YOLO expects
dataset/
  images/
    train/
    val/
  labels/
    train/
    val/
\`\`\`

## Training Command
\`\`\`bash
python train.py \\
  --img 640 \\
  --batch 16 \\
  --epochs 100 \\
  --data dataset.yaml \\
  --weights yolov5s.pt
\`\`\`

## Key Metrics to Watch
- **mAP@0.5**: Primary detection accuracy metric
- **Precision/Recall curve**: Balance between false positives and negatives
- **Inference time**: For real-time apps, target < 30ms/frame

## Deployment Tip
Export to ONNX for CPU inference, TensorRT for GPU — massive speedups in production.`,
    tags: ['AI', 'Computer Vision', 'Python', 'YOLO'],
    date: '2025-07-10',
    read_time_mins: 6,
    is_featured: false,
  },
  {
    id: '4',
    title: 'Understanding Firestore Real-Time Listeners',
    content: `# Firestore Real-Time Listeners

Firestore's real-time capabilities are one of its killer features. But they need careful management.

## Basic Listener
\`\`\`python
from google.cloud import firestore

db = firestore.Client()

def on_snapshot(docs, changes, read_time):
    for change in changes:
        if change.type.name == 'ADDED':
            print(f"New doc: {change.document.to_dict()}")

# Subscribe
col_ref = db.collection('orders')
watch = col_ref.on_snapshot(on_snapshot)

# Always unsubscribe when done!
watch.unsubscribe()
\`\`\`

## Important Gotchas
1. **Always unsubscribe** — memory leaks are real
2. **Composite indexes** are needed for compound queries
3. **Security rules** are evaluated on the server, not client
4. **Offline persistence** works in mobile SDKs, not server SDKs`,
    tags: ['GCP', 'Firestore', 'Backend', 'Python'],
    date: '2025-06-05',
    read_time_mins: 3,
    is_featured: false,
  },
  {
    id: '5',
    title: 'React Performance — Stop Re-rendering Everything',
    content: `# React Performance Patterns

Common mistakes and how to fix them.

## useMemo & useCallback
\`\`\`tsx
// ❌ Expensive calculation on every render
const sorted = items.sort((a, b) => a.score - b.score);

// ✅ Only recalculate when items changes
const sorted = useMemo(
  () => [...items].sort((a, b) => a.score - b.score),
  [items]
);
\`\`\`

## React.memo for Components
\`\`\`tsx
// ❌ Re-renders even when props don't change
function AppIcon({ title, color }) { ... }

// ✅ Skips re-render if props are equal
const AppIcon = React.memo(function AppIcon({ title, color }) { ... });
\`\`\`

## Zustand Over Context
For global state, **Zustand** is far more performant than React Context. Selectors let components subscribe to only the slice they need — avoiding cascade re-renders.`,
    tags: ['React', 'TypeScript', 'Performance', 'Frontend'],
    date: '2025-05-18',
    read_time_mins: 4,
    is_featured: true,
  },
];
