/**
 * Fixed, decorative page backdrop: three slowly drifting colour blobs plus a faint
 * grid that fades out towards the bottom. Purely visual (`aria-hidden`, no pointer
 * events); the drift is CSS-only and switches off for visitors who prefer reduced motion.
 */
export default function Aurora() {
  return (
    <div aria-hidden="true" className="aurora">
      <div className="aurora-blob" data-blob="1" />
      <div className="aurora-blob" data-blob="2" />
      <div className="aurora-blob" data-blob="3" />
      <div className="aurora-grid" />
    </div>
  );
}
