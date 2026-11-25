import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Camera, CameraOff, Check, CircleAlert, Eye, Hand, LoaderCircle } from 'lucide-react'
import { FaceDetector, FilesetResolver, HandLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision'
import SignDemo from '../components/SignDemo'
import { BackLink, Page, PageHeader } from '../components/ui'
import { ALPHABET, letterByChar } from '../data/alphabet'
import { motionForLetter } from '../lib/motion'
import type { FingerState, HandShape } from '../types'

const VISION_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm'
const HAND_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'

const FINGERS: {
  key: keyof Pick<HandShape, 'index' | 'middle' | 'ring' | 'pinky'>
  label: string
  landmarks: [number, number, number]
}[] = [
  { key: 'index', label: 'Index', landmarks: [5, 6, 8] },
  { key: 'middle', label: 'Middle', landmarks: [9, 10, 12] },
  { key: 'ring', label: 'Ring', landmarks: [13, 14, 16] },
  { key: 'pinky', label: 'Little', landmarks: [17, 18, 20] },
]

type FingerPosition = 'extended' | 'curled' | 'bent'
type FingerCheck = { label: string; expected: FingerPosition; actual: FingerPosition; matches: boolean }

function angleAtJoint(
  landmarks: NormalizedLandmark[],
  [base, joint, tip]: [number, number, number],
  width: number,
  height: number,
) {
  const a = { x: landmarks[base].x * width, y: landmarks[base].y * height }
  const b = { x: landmarks[joint].x * width, y: landmarks[joint].y * height }
  const c = { x: landmarks[tip].x * width, y: landmarks[tip].y * height }
  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }
  const lengths = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y)
  if (!lengths) return 0
  const cosine = Math.max(-1, Math.min(1, (ab.x * cb.x + ab.y * cb.y) / lengths))
  return (Math.acos(cosine) * 180) / Math.PI
}

function getFingerPosition(angle: number): FingerPosition {
  if (angle >= 150) return 'extended'
  if (angle <= 125) return 'curled'
  return 'bent'
}

function expectedPosition(state: FingerState): FingerPosition {
  if (state === 'up' || state === 'out') return 'extended'
  if (state === 'curl') return 'curled'
  return 'bent'
}

function checkHandshape(landmarks: NormalizedLandmark[], shape: HandShape, width: number, height: number): FingerCheck[] {
  return FINGERS.map(({ key, label, landmarks: points }) => {
    const expected = expectedPosition(shape[key])
    const actual = getFingerPosition(angleAtJoint(landmarks, points, width, height))
    return { label, expected, actual, matches: expected === actual }
  })
}

function cameraErrorMessage(error: unknown, stage: 'camera' | 'models') {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      return 'Camera access was denied. Allow camera access in your browser settings, then try again.'
    }
    if (error.name === 'NotFoundError') return 'No camera was found on this device.'
    if (error.name === 'NotReadableError') return 'The camera is busy or unavailable. Close other apps using it and try again.'
  }
  if (stage === 'models') return 'The camera models could not load. Check your internet connection and try again.'
  return error instanceof Error ? error.message : 'The camera could not be started.'
}

export default function CameraCoach() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [letter, setLetter] = useState(() => letterByChar(searchParams.get('letter') ?? 'A')?.letter ?? 'A')
  const [cameraState, setCameraState] = useState<'idle' | 'loading' | 'running' | 'error'>('idle')
  const [cameraError, setCameraError] = useState('')
  const [frameStatus, setFrameStatus] = useState<{ face: boolean; fingers: FingerCheck[] | null } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const handLandmarkerRef = useRef<HandLandmarker | null>(null)
  const faceDetectorRef = useRef<FaceDetector | null>(null)
  const animationRef = useRef<number | null>(null)
  const mountedRef = useRef(false)
  const entry = useMemo(() => letterByChar(letter)!, [letter])
  const motion = useMemo(() => motionForLetter(entry), [entry])

  const releaseCamera = useCallback(() => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current)
    animationRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    handLandmarkerRef.current?.close()
    faceDetectorRef.current?.close()
    handLandmarkerRef.current = null
    faceDetectorRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      releaseCamera()
    }
  }, [releaseCamera])

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access requires HTTPS or localhost and a browser that supports video capture.')
      setCameraState('error')
      return
    }

    setCameraState('loading')
    setCameraError('')
    setFrameStatus(null)
    let stream: MediaStream | null = null
    let handLandmarker: HandLandmarker | null = null
    let faceDetector: FaceDetector | null = null
    let stage: 'camera' | 'models' = 'camera'

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      const video = videoRef.current
      if (!video) throw new Error('The camera preview is unavailable.')
      video.srcObject = stream
      await video.play()

      stage = 'models'
      const vision = await FilesetResolver.forVisionTasks(VISION_WASM)
      ;[handLandmarker, faceDetector] = await Promise.all([
        HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: HAND_MODEL },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.55,
          minHandPresenceConfidence: 0.55,
        }),
        FaceDetector.createFromOptions(vision, {
          baseOptions: { modelAssetPath: FACE_MODEL },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.5,
        }),
      ])

      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        handLandmarker.close()
        faceDetector.close()
        return
      }

      streamRef.current = stream
      handLandmarkerRef.current = handLandmarker
      faceDetectorRef.current = faceDetector
      setCameraState('running')
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop())
      handLandmarker?.close()
      faceDetector?.close()
      if (videoRef.current) videoRef.current.srcObject = null
      if (mountedRef.current) {
        setCameraError(cameraErrorMessage(error, stage))
        setCameraState('error')
      }
    }
  }

  const stopCamera = () => {
    releaseCamera()
    setFrameStatus(null)
    setCameraError('')
    setCameraState('idle')
  }

  const chooseLetter = (nextLetter: string) => {
    setLetter(nextLetter)
    setFrameStatus(null)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('letter', nextLetter)
    setSearchParams(nextParams, { replace: true })
  }

  useEffect(() => {
    if (cameraState !== 'running') return

    let lastDetectionAt = 0
    let lastStatusAt = 0
    const detect = (now: number) => {
      const video = videoRef.current
      const canvas = canvasRef.current
      const handLandmarker = handLandmarkerRef.current
      const faceDetector = faceDetectorRef.current

      if (video && canvas && handLandmarker && faceDetector && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && now - lastDetectionAt >= 66) {
        lastDetectionAt = now
        const width = video.videoWidth
        const height = video.videoHeight
        if (width && height) {
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width
            canvas.height = height
          }
          const context = canvas.getContext('2d')
          if (context) {
            context.clearRect(0, 0, width, height)
            const hands = handLandmarker.detectForVideo(video, now)
            const faces = faceDetector.detectForVideo(video, now)

            for (const landmarks of hands.landmarks) {
              context.strokeStyle = '#FACC15'
              context.fillStyle = '#3B82F6'
              context.lineWidth = Math.max(2, width * 0.004)
              for (const { start, end } of HandLandmarker.HAND_CONNECTIONS) {
                const from = landmarks[start]
                const to = landmarks[end]
                if (!from || !to) continue
                context.beginPath()
                context.moveTo(from.x * width, from.y * height)
                context.lineTo(to.x * width, to.y * height)
                context.stroke()
              }
              for (const point of landmarks) {
                context.beginPath()
                context.arc(point.x * width, point.y * height, Math.max(3, width * 0.006), 0, Math.PI * 2)
                context.fill()
              }
            }

            context.strokeStyle = '#38BDF8'
            context.lineWidth = Math.max(2, width * 0.004)
            for (const face of faces.detections) {
              const box = face.boundingBox
              if (box) context.strokeRect(box.originX, box.originY, box.width, box.height)
            }

            if (now - lastStatusAt >= 300) {
              const landmarks = hands.landmarks[0]
              setFrameStatus({
                face: faces.detections.length > 0,
                fingers: landmarks ? checkHandshape(landmarks, entry.shape, width, height) : null,
              })
              lastStatusAt = now
            }
          }
        }
      }
      animationRef.current = requestAnimationFrame(detect)
    }

    animationRef.current = requestAnimationFrame(detect)
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [cameraState, entry])

  const matchingFingers = frameStatus?.fingers?.filter((finger) => finger.matches).length ?? 0

  return (
    <Page>
      <BackLink to="/practice">All practice modes</BackLink>
      <PageHeader eyebrow="Camera coach" title="Practice ASL fingerspelling">
        Pick a letter, watch the reference, and try the handshape in front of your camera.
      </PageHeader>

      <div className="mb-6 flex gap-3 rounded-2xl bg-sky-50 p-4 text-sm text-ink-600" role="note">
        <Eye size={19} className="mt-0.5 shrink-0 text-sky-700" aria-hidden />
        <p>
          Your camera frames are processed in this browser and are not uploaded. The hand and face model files load from Google
          and jsDelivr. This coach checks approximate finger bend and face framing only; it cannot verify thumb placement, palm
          direction, movement, facial grammar, or whether a sign is linguistically correct.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Camera size={19} aria-hidden /> Camera view
            </h2>
            {cameraState === 'running' && <span className="chip bg-emerald-50 text-emerald-800">Camera on</span>}
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-navy">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              aria-label="Mirrored camera preview"
              className={`block h-auto w-full scale-x-[-1] ${cameraState === 'running' ? '' : 'hidden'}`}
            />
            {cameraState === 'running' ? (
              <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full scale-x-[-1]" />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-3 px-6 text-center text-white">
                {cameraState === 'loading' ? <LoaderCircle size={34} className="animate-spin text-sun" aria-hidden /> : <CameraOff size={34} className="text-sky-200" aria-hidden />}
                <p className="font-semibold">
                  {cameraState === 'loading' ? 'Starting camera and loading models…' : 'Your camera preview will appear here'}
                </p>
                <p className="max-w-sm text-sm text-blue-100">Keep one hand and, if possible, your face inside the frame.</p>
              </div>
            )}
          </div>

          {cameraError && (
            <p className="mt-4 flex gap-2 rounded-2xl bg-red-50 p-3 text-sm text-red-800" role="alert">
              <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden /> {cameraError}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            {cameraState === 'running' ? (
              <button className="btn btn-ghost" onClick={stopCamera}>
                <CameraOff size={16} aria-hidden /> Stop camera
              </button>
            ) : (
              <button className="btn btn-primary" onClick={startCamera} disabled={cameraState === 'loading'}>
                {cameraState === 'loading' ? <LoaderCircle size={16} className="animate-spin" aria-hidden /> : <Camera size={16} aria-hidden />}
                {cameraState === 'loading' ? 'Starting…' : cameraState === 'error' ? 'Try camera again' : 'Start camera'}
              </button>
            )}
          </div>

          {cameraState === 'running' && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div
                className={`rounded-2xl p-4 ${
                  !frameStatus?.fingers ? 'bg-sky-50' : matchingFingers === 4 ? 'bg-emerald-50' : 'bg-amber-50'
                }`}
                role="status"
                aria-live="polite"
              >
                <p className="flex items-center gap-2 font-semibold text-navy">
                  {frameStatus?.fingers && matchingFingers === 4
                    ? <Check size={17} aria-hidden />
                    : <Hand size={17} aria-hidden />}
                  Handshape feedback
                </p>
                <p className="mt-1 text-sm text-ink-600">
                  {!frameStatus?.fingers
                    ? 'Move one hand into view.'
                    : matchingFingers === 4
                      ? 'Looks like a match! All 4 checked finger positions match this letter.'
                      : `Not yet: ${matchingFingers} of 4 approximate finger positions match. Adjust your hand and try again.`}
                </p>
              </div>
              <div className={`rounded-2xl p-4 ${frameStatus?.face ? 'bg-emerald-50' : 'bg-sky-50'}`}>
                <p className="flex items-center gap-2 font-semibold text-navy">
                  <Eye size={17} aria-hidden /> Face framing
                </p>
                <p className="mt-1 text-sm text-ink-600">
                  {frameStatus?.face ? 'Face in frame.' : 'Face not found (optional for fingerspelling).'}
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-5">
          <div className="card">
            <label htmlFor="coach-letter" className="eyebrow">Choose a letter</label>
            <select
              id="coach-letter"
              className="input mt-2"
              value={letter}
              onChange={(event) => chooseLetter(event.target.value)}
            >
              {ALPHABET.map(({ letter: item }) => <option key={item} value={item}>{item}</option>)}
            </select>

            <div className="mt-4 flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-navy text-4xl font-extrabold text-white">{entry.letter}</div>
              <div>
                <h2 className="text-lg font-bold">{entry.handshape}</h2>
                <p className="mt-1 text-sm text-ink-600">{entry.summary}</p>
              </div>
            </div>

            <div className="mt-4">
              <SignDemo motion={motion} label={`Schematic ASL letter ${entry.letter}: ${entry.handshape}`} variant="letter" compact />
            </div>

            <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-navy">Try these steps</h3>
            <ol className="mt-3 space-y-2">
              {entry.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm text-ink">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-white">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {cameraState === 'running' && frameStatus?.fingers && (
            <div className="card">
              <h3 className="font-bold text-navy">Approximate finger check</h3>
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {frameStatus.fingers.map((finger) => (
                  <li key={finger.label} className="flex items-center justify-between rounded-xl bg-sky-50 px-3 py-2 text-sm">
                    <span>{finger.label}</span>
                    <span className={`flex items-center gap-1 font-semibold ${finger.matches ? 'text-emerald-700' : 'text-ink-600'}`}>
                      {finger.matches && <Check size={14} aria-hidden />}
                      {finger.actual}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-ink-600">
                Compare your thumb and palm direction with the steps; the camera check does not assess them.
              </p>
            </div>
          )}

          {entry.motion && (
            <p className="rounded-2xl bg-sun-100 p-4 text-sm text-navy">
              This letter also uses movement. The camera coach checks only the starting handshape, not the movement path.
            </p>
          )}
        </section>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-sun-100/70 p-4 text-sm text-ink-600" role="note">
        <CircleAlert size={18} className="mt-0.5 shrink-0 text-sun-600" aria-hidden />
        <p>
          This is a practice aid, not an ASL sign recognizer. Use the{' '}
          <Link to={`/learn/alphabet/${entry.letter}`} className="font-semibold text-sky-700 underline">
            letter lesson
          </Link>{' '}
          and a Deaf teacher or trusted reference to verify the complete sign.
        </p>
      </div>
    </Page>
  )
}
