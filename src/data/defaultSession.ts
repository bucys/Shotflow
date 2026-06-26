import type { ShootSession } from '../types/session'

const defaultSession: ShootSession = {
  id: 'trakai',
  name: 'Trakai Drone Shot List',
  date: '2026-07-12',
  shots: [
    {
      id: 'shot-01',
      title: 'Castle Reveal Pull-Back',
      description:
        'Start tight on the red-brick towers of Trakai Island Castle, then slowly pull back to reveal the full island and surrounding lake. Keep the castle centered as it shrinks into frame.',
      completed: false,
    },
    {
      id: 'shot-02',
      title: 'Lake Galvė Orbit',
      description:
        'A smooth 180° orbit around the castle at mid-altitude. Keep a constant radius so the towers rotate cleanly against the water and treeline behind them.',
      completed: false,
    },
    {
      id: 'shot-03',
      title: 'Sunrise Top-Down',
      description:
        'Straight-down nadir shot of the castle and its courtyard during golden hour. Long shadows from the towers should stretch across the water for depth.',
      completed: false,
    },
    {
      id: 'shot-04',
      title: 'Footbridge Fly-Through',
      description:
        'Low approach along the wooden footbridge connecting the island to the mainland, flying just above the railings toward the main gate at walking-eye height.',
      completed: false,
    },
    {
      id: 'shot-05',
      title: 'Lakeside Treeline Glide',
      description:
        'Lateral tracking shot skimming the shoreline trees with the castle held in the background. Maintain a steady left-to-right drift to layer foreground and subject.',
      completed: false,
    },
    {
      id: 'shot-06',
      title: 'High Establishing Wide',
      description:
        'Maximum-altitude wide shot capturing the entire Trakai lake system, the island castle, and the town. Use this as the opening establishing frame for the edit.',
      completed: false,
    },
    {
      id: 'shot-07',
      title: 'Tower Detail Push-In',
      description:
        'Slow forward push toward the tallest defensive tower, ending on the arched windows. Hold steady to highlight the brickwork texture and battlements.',
      completed: false,
    },
    {
      id: 'shot-08',
      title: 'Reflection Descent',
      description:
        'Descend from sky level down toward the lake surface near the castle so the mirrored reflection fills the lower half of the frame as you approach the water.',
      completed: false,
    },
    {
      id: 'shot-09',
      title: 'Boats & Pier Pass',
      description:
        'Fast lateral pass over the moored boats and wooden piers on the lakefront, with the castle drifting through the background for a sense of scale and motion.',
      completed: false,
    },
    {
      id: 'shot-10',
      title: 'Golden Hour Backlight',
      description:
        'Position the sun directly behind the castle for a backlit silhouette. Expose for the sky to keep rich orange tones and a crisp castle outline.',
      completed: false,
    },
    {
      id: 'shot-11',
      title: 'Courtyard Vertical Rise',
      description:
        'Begin inside the inner courtyard at low altitude, then rise vertically while tilting down to reveal the layout of the keep and surrounding walls.',
      completed: false,
    },
    {
      id: 'shot-12',
      title: 'Departure Fly-Away',
      description:
        'Final shot: fly backward away from the castle over the lake, gaining altitude as the island recedes. Use as the closing frame to bookend the reveal.',
      completed: false,
    },
  ],
}

export default defaultSession
